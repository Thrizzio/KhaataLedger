import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { dashboardApi } from '../api/dashboardApi';

export function useDashboard(workspaceId?: string) {
    return useQuery({
        queryKey: queryKeys.dashboard(workspaceId!),
        queryFn: async () => {
            const response = await dashboardApi.getMetrics(workspaceId!);
            return response.data.data!;
        },
        enabled: Boolean(workspaceId),
    });
}
