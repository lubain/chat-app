import { get, post, patch, tokenStorage } from "./http-client";

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

export const authApi = {
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

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await post<AuthResponse>("/auth/login", {
      email: email.toLowerCase().trim(),
      password,
    });
    tokenStorage.set(response.accessToken);
    return response;
  },

  me: async (): Promise<AuthUser> => get<AuthUser>("/auth/me"),

  updateProfile: async (payload: UpdateProfilePayload): Promise<AuthUser> =>
    patch<AuthUser>("/auth/profile", payload),

  /** Upload base64 image → Cloudinary via backend → retourne le profil mis à jour */
  uploadAvatar: async (base64: string): Promise<AuthUser> =>
    post<AuthUser>("/auth/avatar", { base64 }),

  logout: async (): Promise<void> => {
    try {
      await post("/auth/logout");
    } catch {
      /* best-effort */
    } finally {
      tokenStorage.clear();
    }
  },
};
