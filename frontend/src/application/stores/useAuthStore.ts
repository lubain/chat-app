import { create } from "zustand";
import { HttpError } from "@/infrastructure/api/http-client";
import { authApi, AuthResponse, AuthUser } from "@/infrastructure/api/auth.api";
import {
  connectSocket,
  disconnectSocket,
} from "@/infrastructure/socket/socket-client";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hydrateFromStorage: () => void;
  updateUser: (user: AuthUser) => void;
}

function persistAuth(response: AuthResponse) {
  localStorage.setItem("access_token", response.accessToken);
  localStorage.setItem("auth_user", JSON.stringify(response.user));
}

function persistUser(user: AuthUser) {
  localStorage.setItem("auth_user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("auth_user");
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  hydrateFromStorage: () => {
    const token = localStorage.getItem("access_token");
    const raw = localStorage.getItem("auth_user");
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as AuthUser;
        connectSocket(token);
        set({ user, token });
      } catch {
        clearAuth();
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      persistAuth(response);
      connectSocket(response.accessToken);
      set({
        user: response.user,
        token: response.accessToken,
        isLoading: false,
      });
    } catch (err) {
      const message =
        err instanceof HttpError ? err.messages[0] : "Login failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(name, email, password);
      persistAuth(response);
      connectSocket(response.accessToken);
      set({
        user: response.user,
        token: response.accessToken,
        isLoading: false,
      });
    } catch (err) {
      const message =
        err instanceof HttpError ? err.messages[0] : "Registration failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    clearAuth();
    disconnectSocket();
    set({ user: null, token: null });
  },

  /** Met à jour l'utilisateur en mémoire et dans localStorage */
  updateUser: (user: AuthUser) => {
    persistUser(user);
    set({ user });
  },

  clearError: () => set({ error: null }),
}));
