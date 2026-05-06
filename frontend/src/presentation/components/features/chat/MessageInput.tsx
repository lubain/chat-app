import { useState } from "react";
import { Send, Smile, Paperclip, Loader2, X, Image } from "lucide-react";
import { useTyping } from "@/application/hooks/useTyping";
import { useImageUpload } from "@/application/hooks/useImageUpload";

interface MessageInputProps {
  conversationId: string | null;
  onSend: (text: string) => void;
}

export function MessageInput({ conversationId, onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const { onKeystroke, onMessageSent } = useTyping(conversationId);
  const {
    isUploading,
    error,
    preview,
    fileInputRef,
    openFilePicker,
    handleFileChange,
    clearError,
  } = useImageUpload(conversationId);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (e.target.value.trim()) onKeystroke();
  };

  const submit = () => {
    if (!text.trim()) return;
    onMessageSent();
    onSend(text);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 flex-shrink-0">
      {/* ── Preview d'upload ─────────────────────────────────── */}
      {(preview || isUploading) && (
        <div className="px-4 pt-3 flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {isUploading ? "Envoi en cours…" : "Prêt à envoyer"}
          </div>
        </div>
      )}

      {/* ── Erreur upload ────────────────────────────────────── */}
      {error && (
        <div className="mx-4 mt-2 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-xl">
          <span className="flex-1">{error}</span>
          <button onClick={clearError}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Zone de saisie ───────────────────────────────────── */}
      <div className="p-4">
        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-end space-x-2"
        >
          <div className="flex-1 bg-slate-100 rounded-2xl border border-transparent focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all flex items-end">
            <button
              type="button"
              className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>

            <textarea
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez un message…"
              rows={1}
              className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-sm outline-none text-slate-800"
            />

            {/* Bouton image */}
            <button
              type="button"
              onClick={openFilePicker}
              disabled={isUploading}
              title="Envoyer une image"
              className="p-3 text-slate-400 hover:text-indigo-600 disabled:opacity-40 transition-colors"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              ) : (
                <Image className="w-5 h-5" />
              )}
            </button>

            <button
              type="button"
              className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!text.trim()}
            className={`p-3 rounded-full flex-shrink-0 transition-all ${
              text.trim()
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
