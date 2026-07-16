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
  createdBy?: { id: string; name: string; email: string } | null;
}

export interface CreateTransactionPayload {
  title: string;
  description?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  transactionDate: string;
  workspaceId: string;
}

/** Fields an owner may edit on a transaction */
export interface UpdateTransactionPayload {
  title: string;
  description?: string | null;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  transactionDate: string;
}

export const transactionService = {
  /** Fetch all transactions for a workspace, sorted newest first */
  getTransactions: (workspaceId: string) =>
    httpClient.get<ApiResponse<Transaction[]>>(`/transactions?workspaceId=${workspaceId}`),

  /** Create a transaction scoped to the given workspace */
  createTransaction: (payload: CreateTransactionPayload) =>
    httpClient.post<ApiResponse<Transaction>>('/transactions', payload),

  /** Update a transaction (owners only) */
  updateTransaction: (id: string, payload: UpdateTransactionPayload) =>
    httpClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, payload),

  /** Soft-delete a transaction (owners only) */
  deleteTransaction: (id: string) =>
    httpClient.delete<ApiResponse<Transaction>>(`/transactions/${id}`),
};
