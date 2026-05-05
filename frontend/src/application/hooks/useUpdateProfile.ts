import { useState, useCallback } from "react";
import { authApi } from "../../infrastructure/api/auth.api";
import { useAuthStore } from "../stores/useAuthStore";

interface UseUpdateProfileResult {
  isLoading: boolean;
  error: string | null;
  updateName: (name: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  clearError: () => void;
}

/** Converts a File to a base64 data URL string */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

export function useUpdateProfile(): UseUpdateProfileResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateUser = useAuthStore((s) => s.updateUser);

  const updateName = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setError(null);
    try {
      const updated = await authApi.updateProfile({ name: trimmed });
      updateUser(updated);
    } catch (err: any) {
      setError(err.messages?.[0] ?? "Impossible de mettre à jour le nom.");
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  const uploadAvatar = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image.");
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      const updated = await authApi.uploadAvatar(base64);
      updateUser(updated);
    } catch (err: any) {
      setError(err.messages?.[0] ?? "Impossible d'uploader l'avatar.");
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  return {
    isLoading,
    error,
    updateName,
    uploadAvatar,
    clearError: () => setError(null),
  };
}
