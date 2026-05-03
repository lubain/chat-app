import { create } from "zustand";
import { authApi, AuthResponse } from "@/infrastructure/api/auth.api";
import {
  connectSocket,
  disconnectSocket,
} from "@/infrastructure/socket/socket-client";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: string;
}

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
}

function persistAuth(response: AuthResponse) {
  localStorage.setItem("access_token", response.accessToken);
  localStorage.setItem("auth_user", JSON.stringify(response.user));
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
    } catch (err: any) {
      const message = err.response?.data?.message?.[0] ?? "Login failed";
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
    } catch (err: any) {
      const message = err.response?.data?.message?.[0] ?? "Registration failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    clearAuth();
    disconnectSocket();
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));
