import { create } from "zustand";
import { Contact, Message, User } from "@/domain/entities";

interface ChatState {
  currentUser: User;
  contacts: Contact[];
  messages: Message[];
  activeContactId: number;
  isMobileListVisible: boolean;
  isMenuOpen: boolean;

  setActiveContactId: (id: number) => void;
  setIsMobileListVisible: (visible: boolean) => void;
  setIsMenuOpen: (open: boolean) => void;
  addMessage: (message: Message) => void;
}

const CURRENT_USER: User = {
  id: 0,
  name: "Alexandre Dubois",
  avatar: "https://i.pravatar.cc/150?u=alex",
  status: "En ligne",
};

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 1,
    name: "Sophie Martin",
    avatar: "https://i.pravatar.cc/150?u=sophie",
    lastMessage: "On se voit demain ?",
    time: "10:30",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Lucas Bernard",
    avatar: "https://i.pravatar.cc/150?u=lucas",
    lastMessage: "Le dossier est prêt.",
    time: "Hier",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Équipe Design",
    avatar: "https://i.pravatar.cc/150?u=design",
    lastMessage: "Emma: Super boulot !",
    time: "Mar",
    unread: 5,
    online: true,
  },
  {
    id: 4,
    name: "Thomas Petit",
    avatar: "https://i.pravatar.cc/150?u=thomas",
    lastMessage: "Ok, ça marche.",
    time: "Lun",
    unread: 0,
    online: true,
  },
  {
    id: 5,
    name: "Julie Rousseau",
    avatar: "https://i.pravatar.cc/150?u=julie",
    lastMessage: "Merci beaucoup !",
    time: "Dim",
    unread: 0,
    online: false,
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    senderId: 1,
    text: "Salut Alexandre ! Comment ça va ?",
    time: "10:15",
    status: "read",
  },
  {
    id: 2,
    senderId: 0,
    text: "Salut Sophie ! Très bien et toi ? J'avance sur le projet.",
    time: "10:17",
    status: "read",
  },
  {
    id: 3,
    senderId: 1,
    text: "Génial. Tu penses avoir terminé d'ici vendredi ?",
    time: "10:18",
    status: "read",
  },
  {
    id: 4,
    senderId: 0,
    text: "Oui, sans problème. Je t'enverrai une démo jeudi soir.",
    time: "10:22",
    status: "read",
  },
  {
    id: 5,
    senderId: 1,
    text: "Parfait. On se voit demain pour en discuter ?",
    time: "10:30",
    status: "delivered",
  },
];

export const useChatStore = create<ChatState>((set) => ({
  currentUser: CURRENT_USER,
  contacts: INITIAL_CONTACTS,
  messages: INITIAL_MESSAGES,
  activeContactId: 1,
  isMobileListVisible: true,
  isMenuOpen: false,

  setActiveContactId: (id) => set({ activeContactId: id }),
  setIsMobileListVisible: (visible) => set({ isMobileListVisible: visible }),
  setIsMenuOpen: (open) => set({ isMenuOpen: open }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));
