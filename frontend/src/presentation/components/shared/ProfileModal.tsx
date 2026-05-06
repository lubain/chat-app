import { useState, useRef, useEffect, useCallback } from "react";
import { X, Camera, Loader2, Check, AlertCircle, User } from "lucide-react";
import {
  useUpdateProfile,
  ProfileDraft,
} from "../../../application/hooks/useUpdateProfile";
import { useAuth } from "../../../application/hooks/useAuth";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const { isLoading, error, prepareAvatar, saveProfile, clearError } =
    useUpdateProfile();

  // ── Draft local — rien n'est envoyé tant qu'on ne clique pas Enregistrer ──
  const [draft, setDraft] = useState<ProfileDraft>({
    name: user?.name ?? "",
    avatarFile: null,
    avatarPreview: null,
  });
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Réinitialiser le draft à chaque ouverture
  useEffect(() => {
    if (isOpen && user) {
      setDraft({ name: user.name, avatarFile: null, avatarPreview: null });
      setSaved(false);
      clearError();
    }
  }, [isOpen, user]);

  // Escape pour fermer (si pas de chargement en cours)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) handleCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, isLoading]);

  if (!isOpen || !user) return null;

  const hasChanges =
    draft.name.trim() !== user.name || draft.avatarFile !== null;

  const avatarSrc =
    draft.avatarPreview ??
    user.avatarUrl ??
    `https://i.pravatar.cc/150?u=${user.id}`;

  // ── Sélection d'image : preview locale uniquement ────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset input
    if (!file) return;

    const result = prepareAvatar(file);
    if (!result) return;

    // Libérer l'ancienne preview si existante
    if (draft.avatarPreview) URL.revokeObjectURL(draft.avatarPreview);

    setDraft((d) => ({
      ...d,
      avatarFile: result.file,
      avatarPreview: result.preview,
    }));
  };

  // ── Annuler : remettre le draft à l'état initial ─────────────────────────
  const handleCancel = useCallback(() => {
    if (draft.avatarPreview) URL.revokeObjectURL(draft.avatarPreview);
    onClose();
  }, [draft.avatarPreview, onClose]);

  // ── Enregistrer : envoyer tout en une fois ───────────────────────────────
  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    const success = await saveProfile(draft);
    if (success) {
      if (draft.avatarPreview) URL.revokeObjectURL(draft.avatarPreview);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={!isLoading ? handleCancel : undefined}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Gradient header ───────────────────────────────────── */}
        <div className="h-24 bg-gradient-to-br from-indigo-500 to-indigo-700" />

        {/* Bouton fermer (×) */}
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="absolute top-3 right-3 p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 pb-6">
          {/* ── Avatar ──────────────────────────────────────────── */}
          <div className="flex items-end justify-between -mt-12 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-slate-100">
                <img
                  src={avatarSrc}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlay caméra */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5 text-white" />
                <span className="text-white text-[10px] font-medium">
                  Changer
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Badge "image sélectionnée" */}
            {draft.avatarFile && !saved && (
              <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-200">
                <Camera className="w-3 h-3" />
                Nouvelle photo
              </div>
            )}

            {/* Badge succès */}
            {saved && (
              <div className="flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
                <Check className="w-3.5 h-3.5" />
                Enregistré !
              </div>
            )}
          </div>

          {/* ── Nom ─────────────────────────────────────────────── */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Nom affiché
            </label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
              disabled={isLoading}
              maxLength={50}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all disabled:opacity-60"
            />
          </div>

          {/* ── Email (lecture seule) ────────────────────────────── */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 block">
              Email
            </label>
            <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-sm text-slate-500">{user.email}</span>
            </div>
          </div>

          {/* ── Erreur ──────────────────────────────────────────── */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={clearError}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── Boutons Annuler / Enregistrer ───────────────────── */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Enregistrer
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-3">
            Cliquez sur la photo pour changer l'avatar · Max 5 Mo
          </p>
        </div>
      </div>
    </div>
  );
}
