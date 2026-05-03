import { get, post, patch, tokenStorage } from "./http-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * POST /auth/register
   * Creates a new user account, stores JWT and returns user info.
   */
  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const response = await post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });
    tokenStorage.set(response.accessToken);
    return response;
  },

  /**
   * POST /auth/login
   * Authenticates user with email/password, stores JWT.
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await post<AuthResponse>("/auth/login", {
      email: email.toLowerCase().trim(),
      password,
    });
    tokenStorage.set(response.accessToken);
    return response;
  },

  /**
   * GET /auth/me
   * Fetches the current authenticated user's profile.
   * Uses the stored JWT automatically.
   */
  me: async (): Promise<AuthUser> => {
    return get<AuthUser>("/auth/me");
  },

  /**
   * PATCH /auth/profile
   * Updates the current user's name or avatar.
   */
  updateProfile: async (payload: UpdateProfilePayload): Promise<AuthUser> => {
    return patch<AuthUser>("/auth/profile", payload);
  },

  /**
   * POST /auth/logout
   * Notifies the backend (optional) and clears local token.
   */
  logout: async (): Promise<void> => {
    try {
      await post("/auth/logout");
    } catch {
      // Ignore server errors on logout — clear locally regardless
    } finally {
      tokenStorage.clear();
    }
  },
};
