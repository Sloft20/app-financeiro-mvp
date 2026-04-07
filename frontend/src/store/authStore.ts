import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null; // Tipagem básica por hora. Pode ser mapeada pro JWT depois.
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  logout: () => set({ token: null, user: null }),
}));
