import { useEffect } from "react";
import { getSocket } from "@/infrastructure/socket/socket-client";
import { useChatStore, ChatMessage } from "@/application/stores/useChatStore";
import { useTypingStore } from "@/application/stores/useTypingStore";

export function useSocket() {
  const receiveMessage = useChatStore((s) => s.receiveMessage);
  const setUserOnline = useChatStore((s) => s.setUserOnline);
  const setUserOffline = useChatStore((s) => s.setUserOffline);
  const setTyping = useTypingStore((s) => s.setTyping);
  const clearTyping = useTypingStore((s) => s.clearTyping);

  useEffect(() => {
    let socket: ReturnType<typeof getSocket>;
    try {
      socket = getSocket();
    } catch {
      return;
    }

    const onNewMessage = (message: ChatMessage) => {
      receiveMessage(message);
      // Stopper l'indicateur dès qu'un message arrive
      clearTyping(message.conversationId, message.senderId);
    };

    const onUserOnline = ({ userId }: { userId: string }) =>
      setUserOnline(userId);
    const onUserOffline = ({ userId }: { userId: string }) =>
      setUserOffline(userId);

    const onTypingStart = ({
      userId,
      conversationId,
    }: {
      userId: string;
      conversationId: string;
    }) => setTyping(conversationId, userId);

    const onTypingStop = ({
      userId,
      conversationId,
    }: {
      userId: string;
      conversationId: string;
    }) => clearTyping(conversationId, userId);

    socket.on("message:new", onNewMessage);
    socket.on("user:online", onUserOnline);
    socket.on("user:offline", onUserOffline);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("user:online", onUserOnline);
      socket.off("user:offline", onUserOffline);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [receiveMessage, setUserOnline, setUserOffline, setTyping, clearTyping]);
}
