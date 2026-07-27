import { httpClient } from '../../../api/httpClient';
import type { ApiResponse } from '../../../types/api';
import type { Purchase, PurchaseListParams, PurchaseListResponse, CreatePurchasePayload } from '../types';

export const purchaseApi = {
    getPurchases: async (workspaceId: string, params: PurchaseListParams) => {
        const response = await httpClient.get<ApiResponse<PurchaseListResponse>>(`/workspaces/${workspaceId}/purchases`, { params });
        return response.data.data!;
    },

    createPurchase: async (workspaceId: string, payload: CreatePurchasePayload) => {
        const response = await httpClient.post<ApiResponse<Purchase>>(`/workspaces/${workspaceId}/purchases`, payload);
        return response.data.data!;
    },
};
