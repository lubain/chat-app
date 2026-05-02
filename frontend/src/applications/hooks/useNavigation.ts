import { useNavigationStore } from "@/applications/stores/useNavigationStore";
import { NavigationUseCases } from "@/applications/usecases/NavigationUseCases";

export function useNavigation() {
  const currentView = useNavigationStore((s) => s.currentView);
  const isDarkMode = useNavigationStore((s) => s.isDarkMode);
  const navigateTo = useNavigationStore((s) => s.navigateTo);
  const toggleDarkMode = useNavigationStore((s) => s.toggleDarkMode);

  const handleLogin = () => navigateTo(NavigationUseCases.getPostLoginView());
  const handleLogout = () => navigateTo(NavigationUseCases.getPostLogoutView());
  const handleRegister = () =>
    navigateTo(NavigationUseCases.getPostLoginView());
  const goToRegister = () =>
    navigateTo(NavigationUseCases.getRegisterRedirect());
  const goToLogin = () => navigateTo(NavigationUseCases.getLoginRedirect());

  return {
    currentView,
    isDarkMode,
    toggleDarkMode,
    handleLogin,
    handleLogout,
    handleRegister,
    goToRegister,
    goToLogin,
  };
}
