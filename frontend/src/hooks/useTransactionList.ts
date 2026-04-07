import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface FeedTransaction {
  id: string;
  account_id: string;
  category_id: string;
  amount: number;
  transaction_date: string;
  is_paid: boolean;
  type: "DEBIT" | "CREDIT" | "PIX" | "TRANSFER" | "INCOME";
  description: string;
}

export const useTransactionFeed = () => {
  return useQuery({
    queryKey: ['transactions-feed'],
    queryFn: async () => {
      const { data } = await api.get<FeedTransaction[]>('/transactions/');
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 min
  });
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (id: string) => {
        const response = await api.delete(`/transactions/${id}`);
        return response.data;
      },
      onSuccess: () => {
        // Mágica Invalidation: Se apagar, a lista é re-parseada e o Budget lá em cima ganha recalculação
        queryClient.invalidateQueries({ queryKey: ['transactions-feed'] });
        queryClient.invalidateQueries({ queryKey: ['daily-average'] });
      }
    });
};
