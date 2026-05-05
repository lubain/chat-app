import { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  Loader2,
  Check,
  AlertCircle,
  Pencil,
  User,
} from "lucide-react";
import { useUpdateProfile } from "@/application/hooks/useUpdateProfile";
import { useAuth } from "@/application/hooks/useAuth";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const { isLoading, error, updateName, uploadAvatar, clearError } =
    useUpdateProfile();

  const [name, setName] = useState(user?.name ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync name when user changes
  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  // Focus name input when editing starts
  useEffect(() => {
    if (isEditingName) nameInputRef.current?.focus();
  }, [isEditingName]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const showSuccess = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── Avatar selection ────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    await uploadAvatar(file);
    if (!error) showSuccess();
  };

  // ── Name update ─────────────────────────────────────────────────────────────
  const handleNameSave = async () => {
    if (name.trim() === user.name) {
      setIsEditingName(false);
      return;
    }
    await updateName(name);
    setIsEditingName(false);
    if (!error) showSuccess();
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleNameSave();
    if (e.key === "Escape") {
      setName(user.name);
      setIsEditingName(false);
    }
  };

  const avatarSrc =
    previewUrl ?? user.avatarUrl ?? `https://i.pravatar.cc/150?u=${user.id}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── En-tête gradient ──────────────────────────────────────── */}
        <div className="h-24 bg-gradient-to-br from-indigo-500 to-indigo-700" />

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── Avatar + upload ───────────────────────────────────────── */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-5">
            {/* Avatar avec bouton caméra */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-slate-100">
                {isLoading && previewUrl ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  </div>
                ) : (
                  <img
                    src={avatarSrc}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Overlay caméra au hover */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity disabled:cursor-not-allowed"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>

              {/* Input file caché */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Badge succès */}
            {saved && (
              <div className="flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
                <Check className="w-3.5 h-3.5" />
                Enregistré
              </div>
            )}
          </div>

          {/* ── Nom ───────────────────────────────────────────────── */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Nom affiché
            </label>

            {isEditingName ? (
              <div className="flex gap-2">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  maxLength={50}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-indigo-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <button
                  onClick={handleNameSave}
                  disabled={isLoading || !name.trim()}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group"
              >
                <span className="text-sm font-medium text-slate-900">
                  {user.name}
                </span>
                <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </button>
            )}
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

          {/* ── Erreur ─────────────────────────────────────────── */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={clearError} className="ml-auto">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── Hint avatar ───────────────────────────────────── */}
          <p className="text-center text-xs text-slate-400">
            Cliquez sur la photo pour changer l'avatar · Max 5 Mo
          </p>
        </div>
      </div>
    </div>
  );
}
