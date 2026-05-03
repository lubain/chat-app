import { get, post, patch, withAbortController } from "./http-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConversationParticipant {
  id: string;
  name: string;
  avatarUrl: string;
  status: "online" | "offline" | "away";
}

export interface ConversationLastMessage {
  content: string;
  createdAt: string;
  senderId: string;
}

export interface ConversationResponse {
  id: string;
  participant: ConversationParticipant;
  lastMessage: ConversationLastMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: "sent" | "delivered" | "read";
  createdAt: string;
}

export interface PaginatedMessages {
  data: MessageResponse[];
  hasMore: boolean;
  nextCursor: string | null; // ISO date of oldest message for next page
}

export interface UserSearchResult {
  id: string;
  name: string;
  avatarUrl: string;
  status: "online" | "offline" | "away";
}

// ─── Conversations API ────────────────────────────────────────────────────────

export const conversationApi = {
  /**
   * GET /conversations
   * Returns all conversations for the current user,
   * sorted by most recent activity.
   */
  list: async (): Promise<ConversationResponse[]> => {
    return get<ConversationResponse[]>("/conversations");
  },

  /**
   * POST /conversations
   * Creates or returns an existing 1-to-1 conversation with targetUserId.
   */
  create: async (targetUserId: string): Promise<ConversationResponse> => {
    return post<ConversationResponse>("/conversations", { targetUserId });
  },

  /**
   * GET /conversations/:id/messages
   * Fetches paginated messages (cursor-based via `before` ISO timestamp).
   *
   * @param conversationId - UUID of the conversation
   * @param limit          - Number of messages to fetch (default 50)
   * @param before         - ISO date cursor: fetch messages older than this
   *
   * Returns messages in chronological order (oldest → newest).
   * Use `nextCursor` from response to load the previous page.
   */
  getMessages: async (
    conversationId: string,
    limit = 50,
    before?: string
  ): Promise<PaginatedMessages> => {
    const params: Record<string, string | number> = { limit };
    if (before) params.before = before;

    const data = await get<MessageResponse[]>(
      `/conversations/${conversationId}/messages`,
      { params }
    );

    const hasMore = data.length === limit;
    const nextCursor = hasMore ? data[0].createdAt : null;

    return { data, hasMore, nextCursor };
  },

  /**
   * Cancellable version of getMessages — use when switching conversations
   * quickly (e.g. cancel in-flight request on conversation change).
   *
   * Usage:
   *   const { promise, cancel } = conversationApi.getMessagesCancellable(id);
   *   const result = await promise;
   *   // later: cancel() to abort
   */
  getMessagesCancellable: (
    conversationId: string,
    limit = 50,
    before?: string
  ) => {
    const params: Record<string, string | number> = { limit };
    if (before) params.before = before;

    return withAbortController<PaginatedMessages>(async (signal) => {
      const data = await get<MessageResponse[]>(
        `/conversations/${conversationId}/messages`,
        { params, signal }
      );
      const hasMore = data.length === limit;
      const nextCursor = hasMore ? data[0].createdAt : null;
      return { data, hasMore, nextCursor };
    });
  },

  /**
   * PATCH /conversations/:id/read
   * Marks all messages in a conversation as read for the current user.
   */
  markAsRead: async (conversationId: string): Promise<void> => {
    await patch(`/conversations/${conversationId}/read`);
  },
};

// ─── Users API ────────────────────────────────────────────────────────────────

export const usersApi = {
  /**
   * GET /users
   * Returns all users (excluding the current user).
   */
  list: async (): Promise<UserSearchResult[]> => {
    return get<UserSearchResult[]>("/users");
  },

  /**
   * GET /users?q=:query
   * Searches users by name (case-insensitive, partial match).
   * Returns up to 20 results.
   *
   * @param query - Search string (min 1 char)
   */
  search: async (query: string): Promise<UserSearchResult[]> => {
    const q = query.trim();
    if (!q) return usersApi.list();
    return get<UserSearchResult[]>("/users", { params: { q } });
  },

  /**
   * Cancellable version of search — use for live search inputs
   * to cancel previous request when the user keeps typing.
   *
   * Usage:
   *   const { promise, cancel } = usersApi.searchCancellable("alice");
   *   const results = await promise;
   */
  searchCancellable: (query: string) => {
    return withAbortController<UserSearchResult[]>(async (signal) => {
      const q = query.trim();
      return get<UserSearchResult[]>("/users", {
        params: q ? { q } : {},
        signal,
      });
    });
  },
};
