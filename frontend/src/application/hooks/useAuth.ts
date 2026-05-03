import { useAuthStore } from "@/application/stores/useAuthStore";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const clearError = useAuthStore((s) => s.clearError);
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
    hydrateFromStorage,
  };
}
