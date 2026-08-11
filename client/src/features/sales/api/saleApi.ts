import { httpClient } from '../../../api/httpClient';
import type { ApiResponse } from '../../../types/api';
import type { Sale, SaleListParams, SaleListResponse, CreateSalePayload } from '../types';

export const saleApi = {
    getSales: async (workspaceId: string, params: SaleListParams) => {
        const response = await httpClient.get<ApiResponse<SaleListResponse>>(`/workspaces/${workspaceId}/sales`, { params });
        return response.data.data!;
    },

    createSale: async (workspaceId: string, payload: CreateSalePayload) => {
        const response = await httpClient.post<ApiResponse<Sale>>(`/workspaces/${workspaceId}/sales`, payload);
        return response.data.data!;
    },

    updateSale: async (workspaceId: string, saleId: string, payload: Omit<CreateSalePayload, 'customerId' | 'paymentType'>) => {
        const response = await httpClient.put<ApiResponse<Sale>>(`/workspaces/${workspaceId}/sales/${saleId}`, payload);
        return response.data.data!;
    },
};
