import { httpClient } from '../api/httpClient';
import type { ApiResponse } from '../types/api';

export interface CreateTransactionPayload {
  title: string;
  description?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  transactionDate: string;
  categoryId: string;
  createdById: string;
}

export const transactionService = {
  createTransaction: (payload: CreateTransactionPayload) =>
    httpClient.post<ApiResponse<unknown>>('/transactions', payload),
  getTransactions: () => httpClient.get<ApiResponse<unknown>>('/transactions'),
};
