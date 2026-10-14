import { httpClient } from '../../../api/httpClient';
import type { ApiResponse } from '../../../types/api';
import type { DashboardApiResponse, ActivityItem, LowStockItem } from '../types';

export const dashboardApi = {
    getMetrics: (workspaceId: string) =>
        httpClient.get<ApiResponse<DashboardApiResponse>>(`/workspaces/${workspaceId}/dashboard`),

    getActivity: (workspaceId: string) =>
        httpClient.get<
            ApiResponse<{
                activity: ActivityItem[];
                total: number;
            }>
        >(`/workspaces/${workspaceId}/activity`),

    getLowStock: (workspaceId: string) =>
        httpClient.get<
            ApiResponse<{
                items: LowStockItem[];
                threshold: number;
            }>
        >(`/workspaces/${workspaceId}/inventory/low-stock`),
};
