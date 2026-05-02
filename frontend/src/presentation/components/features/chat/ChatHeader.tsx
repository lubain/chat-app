import { Contact } from "@/domain/entities";
import {
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";

interface ChatHeaderProps {
  activeContact: Contact;
  isMenuOpen: boolean;
  isDarkMode: boolean;
  onToggleMenu: (open: boolean) => void;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onBackToList: () => void;
  getContactStatus: (online: boolean) => string;
}

export function ChatHeader({
  activeContact,
  isMenuOpen,
  isDarkMode,
  onToggleMenu,
  onToggleDarkMode,
  onLogout,
  onBackToList,
  getContactStatus,
}: ChatHeaderProps) {
  return (
    <div className="h-16 px-4 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <button
          onClick={onBackToList}
          className="md:hidden mr-3 p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative">
          <img
            src={activeContact.avatar}
            alt={activeContact.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {activeContact.online && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="ml-3">
          <h3 className="font-semibold text-slate-900">{activeContact.name}</h3>
          <p className="text-xs text-slate-500">
            {getContactStatus(activeContact.online)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1 text-slate-400">
        <button className="p-2 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
          <Video className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1" />

        <div className="relative">
          <button
            onClick={() => onToggleMenu(!isMenuOpen)}
            className="p-2 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden">
              <button
                onClick={() => {
                  onToggleDarkMode();
                  onToggleMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 mr-3 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 mr-3 text-indigo-500" />
                )}
                {isDarkMode ? "Mode clair" : "Mode sombre"}
              </button>
              <div className="h-px bg-slate-100 w-full" />
              <button
                onClick={() => {
                  onLogout();
                  onToggleMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
