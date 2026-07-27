import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { dashboardApi } from '../api/dashboardApi';

export function useActivity(workspaceId?: string) {
    return useQuery({
        queryKey: queryKeys.activity(workspaceId!),
        queryFn: async () => {
            const response = await dashboardApi.getActivity(workspaceId!);
            return response.data.data!;
        },
        enabled: Boolean(workspaceId),
    });
}
