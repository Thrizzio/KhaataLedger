import { httpClient } from '../../../api/httpClient';
import type { ApiResponse } from '../../../types/api';
import type { DashboardMetrics, ActivityItem, LowStockItem } from '../types';

export const dashboardApi = {
    getMetrics: (workspaceId: string) =>
        httpClient.get<ApiResponse<DashboardMetrics>>(`/workspaces/${workspaceId}/dashboard`),

    getActivity: (workspaceId: string) =>
        httpClient.get<ApiResponse<ActivityItem[]>>(`/workspaces/${workspaceId}/activity`),

    getLowStock: (workspaceId: string) =>
        httpClient.get<ApiResponse<LowStockItem[]>>(`/workspaces/${workspaceId}/inventory/low-stock`),
};
