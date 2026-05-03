import { create } from "zustand";

/**
 * Store dédié à l'état "en train d'écrire".
 * Séparé de useChatStore pour éviter des re-renders inutiles sur les messages.
 *
 * Clé : conversationId
 * Valeur : Set de userId en train d'écrire dans cette conversation
 */
interface TypingState {
  // { [conversationId]: Set<userId> }
  typingUsers: Record<string, Set<string>>;

  setTyping: (conversationId: string, userId: string) => void;
  clearTyping: (conversationId: string, userId: string) => void;
  isTyping: (conversationId: string, userId: string) => boolean;
  getTypingUsers: (conversationId: string) => string[];
}

export const useTypingStore = create<TypingState>((set, get) => ({
  typingUsers: {},

  setTyping: (conversationId, userId) => {
    set((s) => {
      const existing = new Set(s.typingUsers[conversationId] ?? []);
      existing.add(userId);
      return { typingUsers: { ...s.typingUsers, [conversationId]: existing } };
    });
  },

  clearTyping: (conversationId, userId) => {
    set((s) => {
      const existing = new Set(s.typingUsers[conversationId] ?? []);
      existing.delete(userId);
      return { typingUsers: { ...s.typingUsers, [conversationId]: existing } };
    });
  },

  isTyping: (conversationId, userId) => {
    return get().typingUsers[conversationId]?.has(userId) ?? false;
  },

  getTypingUsers: (conversationId) => {
    return Array.from(get().typingUsers[conversationId] ?? []);
  },
}));
