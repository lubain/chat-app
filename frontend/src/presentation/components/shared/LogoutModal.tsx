import { useEffect, useRef } from "react";
import { LogOut, X } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutModal({ isOpen, onConfirm, onCancel }: LogoutModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus le bouton Annuler à l'ouverture
  useEffect(() => {
    if (isOpen) cancelRef.current?.focus();
  }, [isOpen]);

  // Fermer sur Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* Fond semi-transparent */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150" />

      {/* Carte modale */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icône */}
        <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-2xl mx-auto mb-5">
          <LogOut className="w-7 h-7 text-red-500" />
        </div>

        {/* Texte */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1.5">
            Se déconnecter ?
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Vous devrez vous reconnecter pour accéder à vos messages.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
