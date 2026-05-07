import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Smile, Image, X, Loader2 } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useTyping } from "@/application/hooks/useTyping";
import { useImageUpload } from "@/application/hooks/useImageUpload";

interface MessageInputProps {
  conversationId: string | null;
  onSend: (text: string) => void;
}

export function MessageInput({ conversationId, onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const { onKeystroke, onMessageSent } = useTyping(conversationId);
  const {
    isUploading,
    error,
    pendingImage,
    fileInputRef,
    openFilePicker,
    handleFileChange,
    sendPendingImage,
    cancelPendingImage,
    clearError,
  } = useImageUpload(conversationId);

  // ── Fermer le picker si clic en dehors ─────────────────────────────────
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmojiPicker]);

  // Fermer le picker sur Escape
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowEmojiPicker(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showEmojiPicker]);

  // ── Insertion d'un emoji à la position du curseur ──────────────────────
  const onEmojiClick = useCallback(
    (emojiData: EmojiClickData) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        setText((t) => t + emojiData.emoji);
        return;
      }

      const start = textarea.selectionStart ?? text.length;
      const end = textarea.selectionEnd ?? text.length;
      const newText = text.slice(0, start) + emojiData.emoji + text.slice(end);
      setText(newText);

      // Repositionner le curseur après l'emoji
      requestAnimationFrame(() => {
        const newPos = start + emojiData.emoji.length;
        textarea.selectionStart = newPos;
        textarea.selectionEnd = newPos;
        textarea.focus();
      });
    },
    [text]
  );

  // ── Envoi texte ────────────────────────────────────────────────────────
  const submitText = useCallback(() => {
    if (!text.trim()) return;
    onMessageSent();
    onSend(text);
    setText("");
    setShowEmojiPicker(false);
  }, [text, onMessageSent, onSend]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (e.target.value.trim()) onKeystroke();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitText();
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 flex-shrink-0">
      {/* ── Preview image en attente ───────────────────────────── */}
      {pendingImage && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
              <img
                src={pendingImage.preview}
                alt="preview"
                className="w-full h-full object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {pendingImage.file.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {(pendingImage.file.size / 1024 / 1024).toFixed(2)} Mo
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={cancelPendingImage}
                disabled={isUploading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Annuler
              </button>
              <button
                onClick={sendPendingImage}
                disabled={isUploading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm shadow-indigo-200"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi…
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Envoyer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Erreur ──────────────────────────────────────────────── */}
      {error && (
        <div className="mx-4 mt-2 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-xl">
          <span className="flex-1">{error}</span>
          <button onClick={clearError}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Zone de saisie ──────────────────────────────────────── */}
      <div className="p-4 relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ── Emoji Picker ──────────────────────────────────────── */}
        {showEmojiPicker && (
          <div
            ref={pickerRef}
            className="absolute bottom-full left-4 mb-2 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200"
          >
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme={Theme.LIGHT}
              lazyLoadEmojis
              searchPlaceHolder="Rechercher un émoji…"
              height={380}
              width={320}
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitText();
          }}
          className="flex items-end space-x-2"
        >
          <div className="flex-1 bg-slate-100 rounded-2xl border border-transparent focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all flex items-end">
            {/* Bouton emoji */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker((v) => !v)}
              className={`p-3 transition-colors ${
                showEmojiPicker
                  ? "text-indigo-600"
                  : "text-slate-400 hover:text-indigo-600"
              }`}
              title="Choisir un émoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={
                pendingImage ? "Ajouter un message…" : "Écrivez un message…"
              }
              rows={1}
              disabled={isUploading}
              className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-sm outline-none text-slate-800 disabled:opacity-50"
            />

            {/* Bouton image */}
            <button
              type="button"
              onClick={openFilePicker}
              disabled={isUploading || !!pendingImage}
              title="Joindre une image"
              className={`p-3 transition-colors ${
                pendingImage
                  ? "text-indigo-500"
                  : "text-slate-400 hover:text-indigo-600"
              } disabled:opacity-40`}
            >
              <Image className="w-5 h-5" />
            </button>
          </div>

          {/* Bouton envoi */}
          <button
            type="submit"
            disabled={!text.trim() || isUploading}
            className={`p-3 rounded-full flex-shrink-0 transition-all ${
              text.trim() && !isUploading
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-95"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
