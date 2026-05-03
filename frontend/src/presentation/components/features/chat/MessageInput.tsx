import { useState } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { useTyping } from "@/application/hooks/useTyping";

interface MessageInputProps {
  conversationId: string | null;
  onSend: (text: string) => void;
}

export function MessageInput({ conversationId, onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const { onKeystroke, onMessageSent } = useTyping(conversationId);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (e.target.value.trim()) onKeystroke();
  };

  const submit = () => {
    if (!text.trim()) return;
    onMessageSent(); // émet typing:stop immédiatement
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
    <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
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
  );
}
