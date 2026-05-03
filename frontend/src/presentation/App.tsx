import { useEffect } from "react";
import { useNavigation } from "../application/hooks/useNavigation";
import { useAuth } from "../application/hooks/useAuth";
import { LoginPage } from "./components/features/auth/LoginPage";
import { RegisterPage } from "./components/features/auth/RegisterPage";
import { ChatLayout } from "./components/features/chat/ChatLayout";

export default function App() {
  const {
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
  } = useNavigation();

  const { user, isAuthenticated, hydrateFromStorage } = useAuth();

  // On mount: restore session from localStorage
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // Redirect to chat if already authenticated
  const view = isAuthenticated && currentView !== "chat" ? "chat" : currentView;

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-300">
        {view === "login" && (
          <LoginPage
            onLogin={handleLogin}
            onGoToRegister={goToRegister}
            isLoading={isLoading}
            error={error}
          />
        )}
        {view === "register" && (
          <RegisterPage
            onRegister={handleRegister}
            onGoToLogin={goToLogin}
            isLoading={isLoading}
            error={error}
          />
        )}
        {view === "chat" && user && (
          <ChatLayout
            currentUserId={user.id}
            currentUserName={user.name}
            currentUserAvatar={user.avatarUrl}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        )}
      </div>
    </div>
  );
}
