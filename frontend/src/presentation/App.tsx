import { useNavigation } from "@/applications/hooks/useNavigation";
import { ChatLayout } from "./components/common/layout/ChatLayout";
import { LoginPage } from "./components/features/auth/LoginPage";
import { RegisterPage } from "./components/features/auth/RegisterPage";

export default function App() {
  const {
    currentView,
    isDarkMode,
    toggleDarkMode,
    handleLogin,
    handleLogout,
    handleRegister,
    goToRegister,
    goToLogin,
  } = useNavigation();

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-300">
        {currentView === "login" && (
          <LoginPage onLogin={handleLogin} onGoToRegister={goToRegister} />
        )}
        {currentView === "register" && (
          <RegisterPage onRegister={handleRegister} onGoToLogin={goToLogin} />
        )}
        {currentView === "chat" && (
          <ChatLayout
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        )}
      </div>
    </div>
  );
}
