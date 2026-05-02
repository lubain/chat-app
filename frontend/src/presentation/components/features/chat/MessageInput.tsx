import { useState } from "react";
import { Send, Smile, Paperclip } from "lucide-react";

interface MessageInputProps {
  onSend: (text: string) => boolean;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sent = onSend(text);
    if (sent !== false) setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(text);
      setText("");
    }
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 bg-slate-100 rounded-2xl border border-transparent focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all flex items-end">
          <button
            type="button"
            className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez un message..."
            className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-sm outline-none text-slate-800"
            rows={1}
          />
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
              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </form>
    </div>
  );
}
