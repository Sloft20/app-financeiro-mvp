import { create } from 'zustand';

interface UIState {
  isFabModalOpen: boolean;
  toggleFabModal: () => void;
  setFabModalOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isFabModalOpen: false,
  toggleFabModal: () => set((state) => ({ isFabModalOpen: !state.isFabModalOpen })),
  setFabModalOpen: (isOpen) => set({ isFabModalOpen: isOpen }),
}));
