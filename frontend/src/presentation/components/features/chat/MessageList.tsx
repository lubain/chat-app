import { useEffect, useRef, useState } from "react";
import { Check, CheckCheck, ZoomIn } from "lucide-react";
import { ChatMessage, ChatContact } from "@/application/stores/useChatStore";
import { useTypingStore } from "@/application/stores/useTypingStore";

interface MessageListProps {
  messages: ChatMessage[];
  activeContact: ChatContact;
  isOwnMessage: (senderId: string) => boolean;
}

/** Indicateur "en train d'écrire" */
function TypingIndicator({ contact }: { contact: ChatContact }) {
  return (
    <div className="flex justify-start items-end gap-2">
      <img
        src={contact.avatar}
        alt=""
        className="w-8 h-8 rounded-full flex-shrink-0 mb-1"
      />
      <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 150}ms`,
                animationDuration: "900ms",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Lightbox pour afficher l'image en grand */
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <img
        src={src}
        alt="Image"
        className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/** Bulle de message image */
function ImageBubble({ imageUrl, isMe }: { imageUrl: string; isMe: boolean }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div
        className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-sm max-w-[240px] ${
          isMe ? "rounded-br-sm" : "rounded-bl-sm"
        }`}
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={imageUrl}
          alt="Image"
          className="w-full h-auto max-h-[300px] object-cover"
          loading="lazy"
        />
        {/* Overlay zoom */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox src={imageUrl} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}

export function MessageList({
  messages,
  activeContact,
  isOwnMessage,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const getTypingUsers = useTypingStore((s) => s.getTypingUsers);
  const typingUsers = getTypingUsers(activeContact.id);
  const isContactTyping = typingUsers.includes(activeContact.participantId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isContactTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="text-center my-4">
        <span className="bg-slate-200/50 text-slate-500 text-xs font-medium px-3 py-1 rounded-full">
          Début de la conversation
        </span>
      </div>

      {messages.map((msg) => {
        const isMe = isOwnMessage(msg.senderId);
        const isImage = msg.messageType === "image" && msg.imageUrl;

        return (
          <div
            key={msg.id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            {!isMe && (
              <img
                src={activeContact.avatar}
                alt=""
                className="w-8 h-8 rounded-full mr-2 self-end mb-1 flex-shrink-0"
              />
            )}
            <div
              className={`max-w-[75%] md:max-w-[60%] flex flex-col ${
                isMe ? "items-end" : "items-start"
              }`}
            >
              {/* ── Bulle ──────────────────────────────────── */}
              {isImage ? (
                <ImageBubble imageUrl={msg.imageUrl!} isMe={isMe} />
              ) : (
                <div
                  className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              )}

              {/* ── Heure + statut ─────────────────────────── */}
              <div className="flex items-center mt-1 space-x-1">
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isMe &&
                  (msg.status === "read" ? (
                    <CheckCheck className="w-3 h-3 text-blue-500" />
                  ) : msg.status === "delivered" ? (
                    <CheckCheck className="w-3 h-3 text-slate-400" />
                  ) : (
                    <Check className="w-3 h-3 text-slate-400" />
                  ))}
              </div>
            </div>
          </div>
        );
      })}

      {isContactTyping && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <TypingIndicator contact={activeContact} />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
