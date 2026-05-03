import { useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { useChat } from "@/application/hooks/useChat";
import { useLogoutConfirm } from "@/application/hooks/useLogoutConfirm";
import { ContactList } from "./ContactList";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { LogoutModal } from "@/presentation/components/shared/LogoutModal";

interface ChatLayoutProps {
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function ChatLayout({
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
}: ChatLayoutProps) {
  const {
    contacts,
    messages,
    activeContact,
    isMobileListVisible,
    isMenuOpen,
    isLoadingContacts,
    isLoadingMessages,
    isStartingConversation,
    loadConversations,
    selectConversation,
    startConversation,
    sendMessage,
    isOwnMessage,
    getContactStatus,
    setIsMobileListVisible,
    setIsMenuOpen,
  } = useChat(currentUserId);

  // ─── Modale de déconnexion (instance unique pour tout le layout) ───────────
  const { isOpen, requestLogout, confirmLogout, cancelLogout } =
    useLogoutConfirm(onLogout);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <>
      <div className="h-screen w-full flex bg-white overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white ${
            !isMobileListVisible ? "hidden md:flex" : "flex"
          }`}
        >
          {isLoadingContacts ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : (
            <ContactList
              currentUser={{
                id: currentUserId,
                name: currentUserName,
                avatar: currentUserAvatar,
                status: "online",
              }}
              contacts={contacts}
              activeContactId={activeContact?.id ?? null}
              onSelectContact={selectConversation}
              onStartConversation={startConversation}
              isStartingConversation={isStartingConversation}
              onLogout={requestLogout}
            />
          )}
        </div>

        {/* ── Zone chat ───────────────────────────────────────────── */}
        <div
          className={`flex-1 flex flex-col bg-[#F8FAFC] ${
            isMobileListVisible ? "hidden md:flex" : "flex"
          }`}
        >
          {activeContact ? (
            <>
              <ChatHeader
                activeContact={activeContact}
                isMenuOpen={isMenuOpen}
                isDarkMode={isDarkMode}
                onToggleMenu={setIsMenuOpen}
                onToggleDarkMode={onToggleDarkMode}
                onLogout={requestLogout}
                onBackToList={() => setIsMobileListVisible(true)}
                getContactStatus={getContactStatus}
              />
              {isLoadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  activeContact={activeContact}
                  isOwnMessage={isOwnMessage}
                />
              )}
              <MessageInput
                conversationId={activeContact.id}
                onSend={sendMessage}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-center px-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
                <Send className="w-9 h-9 text-indigo-300 -ml-1 mt-1" />
              </div>
              <h3 className="text-base font-semibold text-slate-600 mb-1">
                Vos messages
              </h3>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                Sélectionnez une conversation ou recherchez un utilisateur pour
                commencer à discuter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modale de confirmation ────────────────────────────────── */}
      <LogoutModal
        isOpen={isOpen}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
}
