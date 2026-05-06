import { useState, useCallback, useRef } from "react";
import { conversationApi } from "@/infrastructure/api/conversation.api";
import { useChatStore } from "@/application//stores/useChatStore";

/** Converts a File to a base64 data URL */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

interface UseImageUploadResult {
  isUploading: boolean;
  error: string | null;
  preview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  openFilePicker: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearPreview: () => void;
  clearError: () => void;
}

export function useImageUpload(
  conversationId: string | null
): UseImageUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addMessage = useChatStore((s) => s.receiveMessage);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !conversationId) return;

      // Reset input so same file can be re-selected
      e.target.value = "";

      // Validate
      if (!file.type.startsWith("image/")) {
        setError("Le fichier doit être une image (PNG, JPG, GIF, WEBP).");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 8 Mo.");
        return;
      }

      // Local preview immediately
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      setIsUploading(true);
      setError(null);

      try {
        const base64 = await fileToBase64(file);
        const message = await conversationApi.uploadImage(
          conversationId,
          base64
        );

        // Add to store — will be broadcast by WS but we add it locally too
        addMessage({
          ...message,
          messageType: message.messageType as "text" | "image",
          imageUrl: message.imageUrl ?? null,
          createdAt:
            typeof message.createdAt === "string"
              ? message.createdAt
              : new Date(message.createdAt).toISOString(),
        });
      } catch (err: any) {
        setError(err.messages?.[0] ?? "Impossible d'envoyer l'image.");
      } finally {
        setIsUploading(false);
        setPreview(null);
        URL.revokeObjectURL(localUrl);
      }
    },
    [conversationId, addMessage]
  );

  return {
    isUploading,
    error,
    preview,
    fileInputRef,
    openFilePicker,
    handleFileChange,
    clearPreview: () => setPreview(null),
    clearError: () => setError(null),
  };
}
