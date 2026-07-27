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
};
