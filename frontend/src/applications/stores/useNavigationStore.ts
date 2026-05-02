import { create } from "zustand";
import { AppView } from "@/domain/entities/AppView";

interface NavigationState {
  currentView: AppView;
  isDarkMode: boolean;
  navigateTo: (view: AppView) => void;
  toggleDarkMode: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentView: "login",
  isDarkMode: false,
  navigateTo: (view) => set({ currentView: view }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
