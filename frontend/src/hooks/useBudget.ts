import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useBudgetStore, BudgetStatus } from '@/store/budgetStore';

interface BudgetResponse {
  remaining_days: int;
  daily_average: number;
  status: BudgetStatus;
  message: string;
}

export const useDailyBudget = () => {
  const setBudgetStatus = useBudgetStore((state) => state.setBudgetStatus);
  const setLoading = useBudgetStore((state) => state.setLoading);

  return useQuery({
    queryKey: ['daily-average'],
    queryFn: async () => {
      setLoading();
      // O Supabase exigirá auth no Python. Se der erro 401, o interceptor limpa.
      const { data } = await api.get<BudgetResponse>('/budget/daily-average');
      
      // Armazena no Zustand para o Header PWA ler instantaneamente
      setBudgetStatus(data.daily_average, data.status, data.message);
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 min sem fazer req inútil se ficar trocando aba
    refetchOnWindowFocus: true, // Recalcula se abrir app denovo
    retry: 1
  });
};
