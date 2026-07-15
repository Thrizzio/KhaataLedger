import { httpClient } from '../api/httpClient';
import type { ApiResponse } from '../types/api';

export interface Khata {
  id: string;
  workspaceId: string;
  customerName: string;
  contactNumber: string;
  title: string;
  initialAmount: number;
  pendingAmount: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface KhataEntry {
  id: string;
  khataId: string;
  title: string;
  amount: number;
  type: 'CREDIT' | 'PAYMENT';
  entryDate: string;
  createdById: string;
  createdAt: string;
  createdBy?: { name: string };
}

export interface CreateKhataPayload {
  workspaceId: string;
  customerName: string;
  contactNumber: string;
  title: string;
  initialAmount: number;
  createdById: string;
}

export interface UpdateKhataPayload {
  customerName?: string;
  contactNumber?: string;
  initialAmount?: number;
}

export interface CreateKhataEntryPayload {
  title: string;
  amount: number;
  type: 'CREDIT' | 'PAYMENT';
  entryDate: string;
  createdById: string;
}

export const khataService = {
  getKhatas: (workspaceId: string) =>
    httpClient.get<ApiResponse<Khata[]>>(`/khata?workspaceId=${workspaceId}`),

  getKhataDetails: (khataId: string) =>
    httpClient.get<ApiResponse<Khata>>(`/khata/${khataId}`),

  createKhata: (payload: CreateKhataPayload) =>
    httpClient.post<ApiResponse<Khata>>('/khata', payload),

  updateKhata: (khataId: string, payload: UpdateKhataPayload) =>
    httpClient.put<ApiResponse<Khata>>(`/khata/${khataId}`, payload),

  deleteKhata: (khataId: string) =>
    httpClient.delete<ApiResponse<null>>(`/khata/${khataId}`),

  getKhataEntries: (khataId: string) =>
    httpClient.get<ApiResponse<KhataEntry[]>>(`/khata/${khataId}/entries`),

  addKhataEntry: (khataId: string, payload: CreateKhataEntryPayload) =>
    httpClient.post<ApiResponse<KhataEntry>>(`/khata/${khataId}/entries`, payload),
};
