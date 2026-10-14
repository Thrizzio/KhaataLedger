import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { dashboardApi } from '../api/dashboardApi';
import { shouldRetryQuery } from '../../../hooks/queryReliability';
import type { DashboardMetrics } from '../types';

export function useDashboard(workspaceId?: string) {
    return useQuery({
        queryKey: queryKeys.dashboard(workspaceId!),
        queryFn: async () => {
            const response = await dashboardApi.getMetrics(workspaceId!);
            const raw = response.data.data;
            if (!raw) throw new Error('Dashboard response was empty.');
            return {
                todaySales: raw.today.salesTotal,
                todayPurchases: raw.today.purchasesTotal,
                receivables: raw.customers.totalReceivables,
                payables: raw.suppliers.totalPayables,
                inventoryValue: raw.inventory.inventoryValue,
                lowStockCount: raw.inventory.lowStockCount,
            } satisfies DashboardMetrics;
        },
        enabled: Boolean(workspaceId),
        retry: shouldRetryQuery,
    });
}
