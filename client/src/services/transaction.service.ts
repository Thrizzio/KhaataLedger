import { httpClient } from '../api/httpClient';
import type { ApiResponse } from '../types/api';

export interface Transaction {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  transactionDate: string;
  createdAt: string;
  workspaceId: string;
  category?: { id: string; name: string } | null;
  createdBy?: { id: string; name: string; email: string } | null;
}

export interface CreateTransactionPayload {
  title: string;
  description?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  transactionDate: string;
  categoryId: string;
  createdById: string;
  workspaceId: string;          // ← now required
}

export const transactionService = {
  /** Fetch all transactions for a workspace, sorted newest first */
  getTransactions: (workspaceId: string) =>
    httpClient.get<ApiResponse<Transaction[]>>(`/transactions?workspaceId=${workspaceId}`),

  /** Create a transaction scoped to the given workspace */
  createTransaction: (payload: CreateTransactionPayload) =>
    httpClient.post<ApiResponse<Transaction>>('/transactions', payload),
};
