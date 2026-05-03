import { useRef, useEffect } from "react";
import { Search, Lock, X, Loader2, UserPlus, Users } from "lucide-react";
import { ChatContact } from "@/application/stores/useChatStore";
import { UserSearchResult } from "@/infrastructure/api/conversation.api";
import { useUserSearch } from "@/application/hooks/useUserSearch";

interface CurrentUser {
  id: string;
  name: string;
  avatar: string;
  status: string;
}

interface ContactListProps {
  currentUser: CurrentUser;
  contacts: ChatContact[];
  activeContactId: string | null;
  onSelectContact: (id: string) => void;
  onStartConversation: (user: UserSearchResult) => void;
  isStartingConversation: boolean;
  onLogout: () => void;
}

export function ContactList({
  currentUser,
  contacts,
  activeContactId,
  onSelectContact,
  onStartConversation,
  isStartingConversation,
  onLogout,
}: ContactListProps) {
  const { query, setQuery, results, isLoading, error, clear } =
    useUserSearch(300);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSearching = query.trim().length > 0;

  // Close search on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearching) clear();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isSearching, clear]);

  // Filter existing conversations locally when not in user-search mode
  const filteredContacts = isSearching
    ? []
    : contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.lastMessage.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelectUser = (user: UserSearchResult) => {
    onStartConversation(user);
    clear();
  };

  return (
    <>
      {/* ── Header profil ──────────────────────────────────────────── */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={
                currentUser.avatar ||
                `https://i.pravatar.cc/150?u=${currentUser.id}`
              }
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">
              {currentUser.name}
            </h2>
            <p className="text-xs text-slate-500">Mon profil</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Déconnexion"
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
        >
          <Lock className="w-5 h-5" />
        </button>
      </div>

      {/* ── Barre de recherche ─────────────────────────────────────── */}
      <div className="p-3 bg-white border-b border-slate-100 flex-shrink-0">
        <div className="relative">
          {/* Icône gauche : loader ou loupe */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-slate-400" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher ou démarrer une conv…"
            className="w-full pl-9 pr-9 py-2.5 bg-slate-100 rounded-xl text-sm border border-transparent focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
          />

          {/* Bouton clear */}
          {isSearching && (
            <button
              onClick={() => {
                clear();
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Hint sous la barre */}
        {isSearching && !isLoading && !error && (
          <p className="text-[11px] text-slate-400 mt-1.5 px-1">
            {results.length > 0
              ? `${results.length} utilisateur${
                  results.length > 1 ? "s" : ""
                } trouvé${results.length > 1 ? "s" : ""}`
              : "Aucun utilisateur trouvé"}
          </p>
        )}
        {error && (
          <p className="text-[11px] text-red-500 mt-1.5 px-1">{error}</p>
        )}
      </div>

      {/* ── Liste principale ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Mode recherche : résultats utilisateurs ── */}
        {isSearching && (
          <>
            {/* Section titre */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100">
              <UserPlus className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Démarrer une conversation
              </span>
            </div>

            {/* Loading skeleton */}
            {isLoading && (
              <div className="space-y-0">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center p-4 border-b border-slate-100 animate-pulse"
                  >
                    <div className="w-11 h-11 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="ml-3 flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-2/3" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Résultats */}
            {!isLoading &&
              results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  disabled={isStartingConversation}
                  className="w-full flex items-center p-4 border-b border-slate-100 hover:bg-indigo-50 transition-colors text-left disabled:opacity-60 group"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    {user.status === "online" && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-700">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {user.status === "online" ? "En ligne" : "Hors ligne"}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isStartingConversation ? (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                </button>
              ))}

            {/* Aucun résultat */}
            {!isLoading && results.length === 0 && !error && (
              <div className="flex flex-col items-center py-12 px-4 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Aucun résultat
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Aucun utilisateur ne correspond à « {query} »
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Mode normal : liste des conversations ── */}
        {!isSearching && (
          <>
            {contacts.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Conversations récentes
                </span>
              </div>
            )}

            {filteredContacts.length === 0 && contacts.length === 0 && (
              <div className="flex flex-col items-center py-16 px-4 text-center">
                <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  Aucune conversation
                </p>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Recherchez un utilisateur
                  <br />
                  pour démarrer une discussion
                </p>
              </div>
            )}

            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => onSelectContact(contact.id)}
                className={`flex items-center p-4 cursor-pointer transition-colors border-b border-slate-100 hover:bg-slate-50 border-l-4 ${
                  activeContactId === contact.id
                    ? "bg-indigo-50 border-l-indigo-600"
                    : "border-l-transparent"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        activeContactId === contact.id
                          ? "text-indigo-900"
                          : "text-slate-900"
                      }`}
                    >
                      {contact.name}
                    </h3>
                    <span
                      className={`text-xs flex-shrink-0 ml-2 ${
                        contact.unread > 0
                          ? "text-indigo-600 font-semibold"
                          : "text-slate-400"
                      }`}
                    >
                      {contact.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-sm truncate ${
                        contact.unread > 0
                          ? "text-slate-800 font-medium"
                          : "text-slate-500"
                      }`}
                    >
                      {contact.lastMessage || "Démarrer la conversation"}
                    </p>
                    {contact.unread > 0 && (
                      <span className="ml-2 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
