import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface CategoryDistribution {
  name: string;
  amount: number;
  color: string;
}

export interface MonthlyReport {
  total_income: number;
  total_expense: number;
  categories_distribution: CategoryDistribution[];
}

export const useMonthlyReport = () => {
  return useQuery({
    queryKey: ['reports-monthly'],
    queryFn: async () => {
      const { data } = await api.get<MonthlyReport>('/reports/monthly');
      return data;
    }
  });
};
