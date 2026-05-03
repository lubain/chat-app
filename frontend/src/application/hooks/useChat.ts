import { useChatStore } from "@/application/stores/useChatStore";
import { useSocket } from "./useSocket";
import { UserSearchResult } from "@/infrastructure/api/conversation.api";

export function useChat(currentUserId: string) {
  useSocket();

  const contacts = useChatStore((s) => s.contacts);
  const messages = useChatStore((s) => s.messages);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const isMobileListVisible = useChatStore((s) => s.isMobileListVisible);
  const isMenuOpen = useChatStore((s) => s.isMenuOpen);
  const isLoadingContacts = useChatStore((s) => s.isLoadingContacts);
  const isLoadingMessages = useChatStore((s) => s.isLoadingMessages);
  const isStartingConversation = useChatStore((s) => s.isStartingConversation);
  const loadConversations = useChatStore((s) => s.loadConversations);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const startConversation = useChatStore((s) => s.startConversation);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const setIsMobileListVisible = useChatStore((s) => s.setIsMobileListVisible);
  const setIsMenuOpen = useChatStore((s) => s.setIsMenuOpen);

  const activeContact =
    contacts.find((c) => c.id === activeConversationId) ?? null;

  const handleSendMessage = (content: string) =>
    sendMessage(content, currentUserId);
  const handleStartConversation = (user: UserSearchResult) =>
    startConversation(user);
  const isOwnMessage = (senderId: string) => senderId === currentUserId;
  const getContactStatus = (online: boolean) =>
    online ? "En ligne" : "Hors ligne";

  return {
    contacts,
    messages,
    activeConversationId,
    activeContact,
    isMobileListVisible,
    isMenuOpen,
    isLoadingContacts,
    isLoadingMessages,
    isStartingConversation,
    loadConversations,
    selectConversation,
    startConversation: handleStartConversation,
    sendMessage: handleSendMessage,
    isOwnMessage,
    getContactStatus,
    setIsMobileListVisible,
    setIsMenuOpen,
  };
}
