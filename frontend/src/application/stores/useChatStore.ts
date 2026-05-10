import { create } from "zustand";
import {
  conversationApi,
  ConversationResponse,
  MessageResponse,
  UserSearchResult,
} from "@/infrastructure/api/conversation.api";
import { getSocket } from "@/infrastructure/socket/socket-client";

export interface ChatContact {
  id: string;
  participantId: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: string;
  messageType: "text" | "image";
  imageUrl: string | null;
  createdAt: string;
}

interface ChatState {
  contacts: ChatContact[];
  messages: ChatMessage[];
  activeConversationId: string | null;
  isMobileListVisible: boolean;
  isMenuOpen: boolean;
  isLoadingContacts: boolean;
  isLoadingMessages: boolean;
  isStartingConversation: boolean;

  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  selectConversation: (conversationId: string) => void;
  startConversation: (user: UserSearchResult) => Promise<void>;
  sendMessage: (content: string, currentUserId: string) => void;
  receiveMessage: (message: ChatMessage) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  markAsRead: (conversationId: string) => void;
  setIsMobileListVisible: (v: boolean) => void;
  setIsMenuOpen: (v: boolean) => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Hier";
  if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
}

function toContact(conv: ConversationResponse): ChatContact {
  return {
    id: conv.id,
    participantId: conv.participant.id,
    name: conv.participant.name,
    avatar: conv.participant.avatarUrl,
    lastMessage: conv.lastMessage?.content ?? "",
    time: conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : "",
    unread: conv.unreadCount,
    online: conv.participant.status === "online",
  };
}

function toMessage(m: MessageResponse): ChatMessage {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    content: m.content,
    status: m.status,
    messageType: m.messageType ?? "text",
    imageUrl: m.imageUrl ?? null,
    createdAt: m.createdAt,
  };
}

export const useChatStore = create<ChatState>((set, get) => ({
  contacts: [],
  messages: [],
  activeConversationId: null,
  isMobileListVisible: true,
  isMenuOpen: false,
  isLoadingContacts: false,
  isLoadingMessages: false,
  isStartingConversation: false,

  loadConversations: async () => {
    set({ isLoadingContacts: true });
    try {
      const data = await conversationApi.list();
      set({ contacts: data.map(toContact), isLoadingContacts: false });
    } catch {
      set({ isLoadingContacts: false });
    }
  },

  loadMessages: async (conversationId) => {
    set({ isLoadingMessages: true });
    try {
      const { data } = await conversationApi.getMessages(conversationId);
      set({ messages: data.map(toMessage), isLoadingMessages: false });
    } catch {
      set({ isLoadingMessages: false });
    }
  },

  selectConversation: (conversationId) => {
    set({ activeConversationId: conversationId, isMobileListVisible: false });
    get().loadMessages(conversationId);
    get().markAsRead(conversationId);
  },

  /**
   * Create or open a conversation with a user found via search.
   * - If a conversation already exists with this user, open it directly.
   * - Otherwise, create it via API, add to contacts list, then open it.
   */
  startConversation: async (user: UserSearchResult) => {
    const { contacts, selectConversation } = get();

    // Check if conversation already exists
    const existing = contacts.find((c) => c.participantId === user.id);
    if (existing) {
      selectConversation(existing.id);
      return;
    }

    set({ isStartingConversation: true });
    try {
      const conv = await conversationApi.create(user.id);
      const newContact = toContact(conv);

      // Prepend to contacts list
      set((s) => ({
        contacts: [newContact, ...s.contacts],
        isStartingConversation: false,
      }));

      selectConversation(conv.id);
    } catch {
      set({ isStartingConversation: false });
    }
  },

  sendMessage: (content, currentUserId) => {
    const { activeConversationId } = get();
    if (!activeConversationId || !content.trim()) return;

    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      conversationId: activeConversationId,
      senderId: currentUserId,
      content: content.trim(),
      status: "sent",
      messageType: "text",
      imageUrl: null,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ messages: [...s.messages, optimistic] }));

    try {
      getSocket().emit("message:send", {
        conversationId: activeConversationId,
        content: content.trim(),
      });
    } catch {
      set((s) => ({
        messages: s.messages.filter((m) => m.id !== optimistic.id),
      }));
    }
  },

  receiveMessage: (message) => {
    const { activeConversationId } = get();
    set((s) => {
      const messages = s.messages.some(
        (m) =>
          m.id.startsWith("opt-") &&
          m.content === message.content &&
          m.senderId === message.senderId
      )
        ? s.messages.map((m) =>
            m.id.startsWith("opt-") && m.content === message.content
              ? message
              : m
          )
        : [...s.messages, message];

      const contacts = s.contacts.map((c) =>
        c.id === message.conversationId
          ? {
              ...c,
              lastMessage: message.content,
              time: formatTime(message.createdAt),
              unread: c.id === activeConversationId ? 0 : c.unread + 1,
            }
          : c
      );
      return { messages, contacts };
    });

    if (message.conversationId === activeConversationId) {
      get().markAsRead(message.conversationId);
    }
  },

  setUserOnline: (userId) =>
    set((s) => ({
      contacts: s.contacts.map((c) =>
        c.participantId === userId ? { ...c, online: true } : c
      ),
    })),

  setUserOffline: (userId) =>
    set((s) => ({
      contacts: s.contacts.map((c) =>
        c.participantId === userId ? { ...c, online: false } : c
      ),
    })),

  markAsRead: (conversationId) => {
    set((s) => ({
      contacts: s.contacts.map((c) =>
        c.id === conversationId ? { ...c, unread: 0 } : c
      ),
    }));
    try {
      getSocket().emit("message:read", { conversationId });
    } catch {
      /* offline */
    }
  },

  setIsMobileListVisible: (v) => set({ isMobileListVisible: v }),
  setIsMenuOpen: (v) => set({ isMenuOpen: v }),
}));
