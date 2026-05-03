import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Send,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onGoToRegister: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function LoginPage({
  onLogin,
  onGoToRegister,
  isLoading,
  error,
}: LoginPageProps) {
  const [email, setEmail] = useState("alex@exemple.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-slate-100">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
              <Send className="w-8 h-8 -ml-1 mt-1" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Bon retour !</h1>
            <p className="text-slate-500 mt-2">
              Connectez-vous pour retrouver vos messages.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="vous@exemple.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Mot de passe
                </label>
                <a
                  href="#"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Oublié ?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-8">
            Pas encore de compte ?{" "}
            <button
              onClick={onGoToRegister}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              S'inscrire
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
