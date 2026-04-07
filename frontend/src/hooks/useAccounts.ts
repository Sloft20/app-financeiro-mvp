import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface AccountData {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export interface CategoryData {
  id: string;
  name: string;
  type: string;
}

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data } = await api.get<AccountData[]>('/accounts/');
      return data;
    },
    staleTime: 1000 * 60 * 30, // Conta raramente muda lista de nomes
    retry: false
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<CategoryData[]>('/categories/');
      return data;
    },
    staleTime: 1000 * 60 * 60,
    retry: false
  });
};

export const useSetupAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; type: string; balance: number }) => {
      const { data } = await api.post('/accounts/setup', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['daily-average'] });
    }
  });
};
