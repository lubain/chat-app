import { Contact, User } from "@/domain/entities";
import { Search } from "lucide-react";

interface ContactListProps {
  currentUser: User;
  contacts: Contact[];
  activeContactId: number;
  onSelectContact: (id: number) => void;
  onLogout: () => void;
}

export function ContactList({
  currentUser,
  contacts,
  activeContactId,
  onSelectContact,
}: ContactListProps) {
  return (
    <>
      {/* En-tête profil */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="relative">
            <img
              src={currentUser.avatar}
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
      </div>

      {/* Barre de recherche */}
      <div className="p-4 bg-white">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un message..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg text-sm transition-all outline-none"
          />
        </div>
      </div>

      {/* Liste des contacts */}
      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact.id)}
            className={`flex items-center p-4 cursor-pointer transition-colors border-b border-slate-100 hover:bg-slate-100 ${
              activeContactId === contact.id
                ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                : "border-l-4 border-l-transparent"
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
                  className={`text-xs ${
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
                  {contact.lastMessage}
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
      </div>
    </>
  );
}
