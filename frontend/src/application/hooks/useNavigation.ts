import { useNavigationStore } from "@/application/stores/useNavigationStore";
import { useAuthStore } from "@/application/stores/useAuthStore";

export function useNavigation() {
  const currentView = useNavigationStore((s) => s.currentView);
  const isDarkMode = useNavigationStore((s) => s.isDarkMode);
  const navigateTo = useNavigationStore((s) => s.navigateTo);
  const toggleDarkMode = useNavigationStore((s) => s.toggleDarkMode);

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    navigateTo("chat");
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string
  ) => {
    await register(name, email, password);
    navigateTo("chat");
  };

  const handleLogout = () => {
    logout();
    navigateTo("login");
  };

  const goToRegister = () => {
    clearError();
    navigateTo("register");
  };
  const goToLogin = () => {
    clearError();
    navigateTo("login");
  };

  return {
    currentView,
    isDarkMode,
    isLoading,
    error,
    toggleDarkMode,
    handleLogin,
    handleLogout,
    handleRegister,
    goToRegister,
    goToLogin,
    clearError,
  };
}
