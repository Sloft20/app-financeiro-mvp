import { create } from 'zustand';

// Status espelhados da API FastAPI de gamificação
export type BudgetStatus = "danger" | "warning" | "success" | "excellent" | "loading";

interface BudgetState {
  dailyAverage: number | null;
  status: BudgetStatus;
  message: string | null;
  setBudgetStatus: (dailyAverage: number, status: BudgetStatus, message: string) => void;
  setLoading: () => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  dailyAverage: null,
  status: "loading",
  message: null,
  setBudgetStatus: (dailyAverage, status, message) => set({ dailyAverage, status, message }),
  setLoading: () => set({ status: "loading", dailyAverage: null, message: null }),
}));
