import { httpClient } from '../../../api/httpClient';
import type { ApiResponse } from '../../../types/api';
import type {
    Supplier,
    SupplierListParams,
    SupplierListResponse,
    CreateSupplierPayload,
    UpdateSupplierPayload,
    SupplierLedgerResponse
} from '../types';

export const supplierApi = {
    getSuppliers: async (workspaceId: string, params: SupplierListParams) => {
        const response = await httpClient.get<ApiResponse<SupplierListResponse>>(`/workspaces/${workspaceId}/suppliers`, { params });
        return response.data.data!;
    },

    getSupplier: async (workspaceId: string, id: string) => {
        const response = await httpClient.get<ApiResponse<Supplier>>(`/workspaces/${workspaceId}/suppliers/${id}`);
        return response.data.data!;
    },

    getSupplierLedger: async (workspaceId: string, id: string) => {
        const response = await httpClient.get<ApiResponse<SupplierLedgerResponse>>(`/workspaces/${workspaceId}/suppliers/${id}/ledger`);
        return response.data.data!;
    },

    createSupplier: async (workspaceId: string, payload: CreateSupplierPayload) => {
        const response = await httpClient.post<ApiResponse<Supplier>>(`/workspaces/${workspaceId}/suppliers`, payload);
        return response.data.data!;
    },

    updateSupplier: async (workspaceId: string, id: string, payload: UpdateSupplierPayload) => {
        const response = await httpClient.patch<ApiResponse<Supplier>>(`/workspaces/${workspaceId}/suppliers/${id}`, payload);
        return response.data.data!;
    },

    deleteSupplier: async (workspaceId: string, id: string) => {
        const response = await httpClient.delete<ApiResponse<Supplier>>(`/workspaces/${workspaceId}/suppliers/${id}`);
        return response.data.data!;
    },
};
