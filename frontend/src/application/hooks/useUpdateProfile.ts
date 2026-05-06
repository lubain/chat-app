import { useState, useCallback } from "react";
import { authApi } from "../../infrastructure/api/auth.api";
import { useAuthStore } from "../stores/useAuthStore";

export interface ProfileDraft {
  name: string;
  avatarFile: File | null;
  avatarPreview: string | null; // URL locale pour preview
}

interface UseUpdateProfileResult {
  isLoading: boolean;
  error: string | null;
  /** Valide le fichier image et retourne une preview locale sans uploader */
  prepareAvatar: (file: File) => { preview: string; file: File } | null;
  /** Enregistre le draft (nom + avatar) en une seule opération */
  saveProfile: (draft: ProfileDraft) => Promise<boolean>;
  clearError: () => void;
}

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

  /** Valide le fichier et génère la preview locale — sans uploader */
  const prepareAvatar = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image.");
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return null;
    }
    const preview = URL.createObjectURL(file);
    return { preview, file };
  }, []);

  /** Envoie nom + avatar si modifiés, en une seule action */
  const saveProfile = useCallback(
    async (draft: ProfileDraft): Promise<boolean> => {
      const { name, avatarFile } = draft;
      setIsLoading(true);
      setError(null);

      try {
        let updated = null;

        // 1. Upload avatar si un fichier a été sélectionné
        if (avatarFile) {
          const base64 = await fileToBase64(avatarFile);
          updated = await authApi.uploadAvatar(base64);
        }

        // 2. Mettre à jour le nom si modifié
        const trimmedName = name.trim();
        if (trimmedName && trimmedName !== (updated?.name ?? "")) {
          updated = await authApi.updateProfile({ name: trimmedName });
        }

        if (updated) updateUser(updated);
        return true;
      } catch (err: any) {
        setError(err.messages?.[0] ?? "Impossible d'enregistrer le profil.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [updateUser]
  );

  return {
    isLoading,
    error,
    prepareAvatar,
    saveProfile,
    clearError: () => setError(null),
  };
}
