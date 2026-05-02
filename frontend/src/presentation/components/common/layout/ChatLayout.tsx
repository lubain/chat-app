import { Send } from "lucide-react";
import { useChat } from "@/applications/hooks/useChat";
import { ContactList } from "@/presentation/components/features/chat/ContactList";
import { ChatHeader } from "@/presentation/components/features/chat/ChatHeader";
import { MessageList } from "@/presentation/components/features/chat/MessageList";
import { MessageInput } from "@/presentation/components/features/chat/MessageInput";

interface ChatLayoutProps {
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function ChatLayout({
  onLogout,
  isDarkMode,
  onToggleDarkMode,
}: ChatLayoutProps) {
  const {
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
  } = useChat();

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden">
      {/* Barre latérale (Contacts) */}
      <div
        className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50 transition-all duration-300 ${
          !isMobileListVisible ? "hidden md:flex" : "flex"
        }`}
      >
        <ContactList
          currentUser={currentUser}
          contacts={contacts}
          activeContactId={activeContactId}
          onSelectContact={selectContact}
          onLogout={onLogout}
        />
      </div>

      {/* Zone de chat */}
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
              onLogout={onLogout}
              onBackToList={() => setIsMobileListVisible(true)}
              getContactStatus={getContactStatus}
            />
            <MessageList
              messages={messages}
              activeContact={activeContact}
              isOwnMessage={isOwnMessage}
            />
            <MessageInput onSend={sendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center text-slate-400">
              <Send className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Sélectionnez une conversation pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
