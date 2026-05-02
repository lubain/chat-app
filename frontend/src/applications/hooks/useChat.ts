import { useChatStore } from "@/applications/stores/useChatStore";
import { ChatUseCases } from "@/applications/usecases/ChatUseCases";

export function useChat() {
  const currentUser = useChatStore((s) => s.currentUser);
  const contacts = useChatStore((s) => s.contacts);
  const messages = useChatStore((s) => s.messages);
  const activeContactId = useChatStore((s) => s.activeContactId);
  const isMobileListVisible = useChatStore((s) => s.isMobileListVisible);
  const isMenuOpen = useChatStore((s) => s.isMenuOpen);
  const setActiveContactId = useChatStore((s) => s.setActiveContactId);
  const setIsMobileListVisible = useChatStore((s) => s.setIsMobileListVisible);
  const setIsMenuOpen = useChatStore((s) => s.setIsMenuOpen);
  const addMessage = useChatStore((s) => s.addMessage);

  const activeContact = contacts.find((c) => c.id === activeContactId) ?? null;

  const selectContact = (id: number) => {
    setActiveContactId(id);
    setIsMobileListVisible(false);
  };

  const sendMessage = (text: string) => {
    const message = ChatUseCases.buildNewMessage(
      text,
      currentUser.id,
      messages
    );
    if (message) addMessage(message);
    return !!message;
  };

  const isOwnMessage = (senderId: number) =>
    ChatUseCases.isOwnMessage(senderId, currentUser.id);

  const getContactStatus = (online: boolean) =>
    ChatUseCases.formatContactStatus(online);

  return {
    currentUser,
    contacts,
    messages,
    activeContactId,
    activeContact,
    isMobileListVisible,
    isMenuOpen,
    selectContact,
    sendMessage,
    isOwnMessage,
    getContactStatus,
    setIsMobileListVisible,
    setIsMenuOpen,
  };
}
