import { httpClient } from '../../../api/httpClient';
import type { ApiResponse } from '../../../types/api';
import type {
    InventoryItem,
    InventoryListParams,
    InventoryListResponse,
    CreateInventoryPayload,
    UpdateInventoryPayload
} from '../types';

export const inventoryApi = {
    getInventory: async (workspaceId: string, params: InventoryListParams) => {
        const response = await httpClient.get<ApiResponse<InventoryListResponse>>(`/workspaces/${workspaceId}/inventory`, { params });
        return response.data.data!;
    },

    createInventory: async (workspaceId: string, payload: CreateInventoryPayload) => {
        const response = await httpClient.post<ApiResponse<InventoryItem>>(`/workspaces/${workspaceId}/inventory`, payload);
        return response.data.data!;
    },

    updateInventory: async (workspaceId: string, id: string, payload: UpdateInventoryPayload) => {
        const response = await httpClient.patch<ApiResponse<InventoryItem>>(`/workspaces/${workspaceId}/inventory/${id}`, payload);
        return response.data.data!;
    },

    deleteInventory: async (workspaceId: string, id: string) => {
        const response = await httpClient.delete<ApiResponse<InventoryItem>>(`/workspaces/${workspaceId}/inventory/${id}`);
        return response.data.data!;
    },
};
