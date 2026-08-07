import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { reportsApi } from '../api/reportsApi';
import type { ReportPeriod } from '../types';

export function useReports(workspaceId: string, period: ReportPeriod) {
    return useQuery({
        queryKey: queryKeys.reports(workspaceId, period),
        queryFn: async () => {
            const response = await reportsApi.getReports(workspaceId, period);
            return response.data.data;
        },
        enabled: Boolean(workspaceId),
    });
}
