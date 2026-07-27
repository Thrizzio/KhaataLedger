import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { dashboardApi } from '../api/dashboardApi';

export function useLowStock(workspaceId?: string) {
    return useQuery({
        queryKey: queryKeys.inventory.lowStock(workspaceId!),
        queryFn: async () => {
            const response = await dashboardApi.getLowStock(workspaceId!);
            return response.data.data!;
        },
        enabled: Boolean(workspaceId),
    });
}
