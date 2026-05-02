import { Contact, Message } from "@/domain/entities";
import { Check, CheckCheck } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  activeContact: Contact;
  isOwnMessage: (senderId: number) => boolean;
}

export function MessageList({
  messages,
  activeContact,
  isOwnMessage,
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="text-center my-4">
        <span className="bg-slate-200/50 text-slate-500 text-xs font-medium px-3 py-1 rounded-full">
          Aujourd'hui
        </span>
      </div>

      {messages.map((msg) => {
        const isMe = isOwnMessage(msg.senderId);
        return (
          <div
            key={msg.id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            {!isMe && (
              <img
                src={activeContact.avatar}
                alt=""
                className="w-8 h-8 rounded-full mr-2 self-end mb-1"
              />
            )}
            <div
              className={`max-w-[75%] md:max-w-[60%] flex flex-col ${
                isMe ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                  isMe
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              <div className="flex items-center mt-1 space-x-1">
                <span className="text-[10px] text-slate-400 font-medium">
                  {msg.time}
                </span>
                {isMe &&
                  (msg.status === "read" ? (
                    <CheckCheck className="w-3 h-3 text-blue-500" />
                  ) : (
                    <Check className="w-3 h-3 text-slate-400" />
                  ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
