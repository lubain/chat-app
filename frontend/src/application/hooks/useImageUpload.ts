import { useState, useCallback, useRef } from "react";
import { conversationApi } from "../../infrastructure/api/conversation.api";
import { useChatStore } from "../stores/useChatStore";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

export interface PendingImage {
  file: File;
  preview: string; // URL locale object URL
}

interface UseImageUploadResult {
  isUploading: boolean;
  error: string | null;
  pendingImage: PendingImage | null; // image sélectionnée mais pas encore envoyée
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  openFilePicker: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sendPendingImage: () => Promise<void>; // envoi explicite
  cancelPendingImage: () => void; // annuler la sélection
  clearError: () => void;
}

export function useImageUpload(
  conversationId: string | null
): UseImageUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const receiveMessage = useChatStore((s) => s.receiveMessage);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Sélection du fichier → preview locale uniquement, pas d'upload
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // reset pour permettre re-sélection du même fichier
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Le fichier doit être une image (PNG, JPG, GIF, WEBP).");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 8 Mo.");
        return;
      }

      // Libérer l'ancienne preview si elle existe
      if (pendingImage?.preview) URL.revokeObjectURL(pendingImage.preview);

      const preview = URL.createObjectURL(file);
      setPendingImage({ file, preview });
      setError(null);
    },
    [pendingImage]
  );

  // Envoi explicite (bouton Envoyer)
  const sendPendingImage = useCallback(async () => {
    if (!pendingImage || !conversationId) return;

    setIsUploading(true);
    setError(null);

    try {
      const base64 = await fileToBase64(pendingImage.file);
      const message = await conversationApi.uploadImage(conversationId, base64);

      receiveMessage({
        ...message,
        messageType: (message as any).messageType ?? "image",
        imageUrl: (message as any).imageUrl ?? null,
        createdAt:
          typeof message.createdAt === "string"
            ? message.createdAt
            : new Date(message.createdAt).toISOString(),
      });

      // Nettoyage après envoi réussi
      URL.revokeObjectURL(pendingImage.preview);
      setPendingImage(null);
    } catch (err: any) {
      setError(err.messages?.[0] ?? "Impossible d'envoyer l'image.");
    } finally {
      setIsUploading(false);
    }
  }, [pendingImage, conversationId, receiveMessage]);

  // Annuler la sélection
  const cancelPendingImage = useCallback(() => {
    if (pendingImage?.preview) URL.revokeObjectURL(pendingImage.preview);
    setPendingImage(null);
    setError(null);
  }, [pendingImage]);

  return {
    isUploading,
    error,
    pendingImage,
    fileInputRef,
    openFilePicker,
    handleFileChange,
    sendPendingImage,
    cancelPendingImage,
    clearError: () => setError(null),
  };
}
