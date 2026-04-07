import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useUIStore } from '@/store/uiStore';

// Tipagem deve bater exatamente com Pydantic Schema de Backend!
export interface TransactionCreatePayload {
  account_id: string; // Vai requerer seed / banco, hoje mockamos
  category_id: string; // Mocaremos na versão 1 caso nao exista na UI real
  amount: number;
  transaction_date: string;
  is_paid: boolean;
  type: "DEBIT" | "CREDIT" | "PIX" | "TRANSFER" | "INCOME";
  description: string;
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const closeModal = useUIStore((state) => state.setFabModalOpen);

  return useMutation({
    mutationFn: async (payload: TransactionCreatePayload) => {
      const response = await api.post('/transactions/', payload);
      return response.data;
    },
    onSuccess: () => {
      // Magia UX: Pipa modal e invalida o cache visual para o Diário Médio atualizar na hora!
      closeModal(false);
      queryClient.invalidateQueries({ queryKey: ['daily-average'] });
      // A UI Store pode até dar um toast confirmando.
    },
    onError: (error) => {
      console.error("Falha ao registrar:", error);
    }
  });
};
