import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface GoalData {
  id: string;
  name: string;
  target_amount: number;
  current_saved: number;
  target_date: string;
}

export interface BudgetData {
  id: string;
  category_id: string;
  planned_amount: number;
  categories?: { name: string, type: string };
}

export const useGoals = () => {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data } = await api.get<GoalData[]>('/goals/');
      return data;
    }
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; target_amount: number; target_date: string }) => {
      const { data } = await api.post('/goals/', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['daily-average'] }); // O Diário Médio afunda na hora
    }
  });
};

export const useBudgets = () => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data } = await api.get<BudgetData[]>('/planner/');
      return data;
    }
  });
};

export const useSetBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { category_id: string; reference_month: string; planned_amount: number }) => {
      const { data } = await api.post('/planner/', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['daily-average'] });
    }
  });
};
