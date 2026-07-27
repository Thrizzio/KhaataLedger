import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { dashboardApi } from '../api/dashboardApi';

export function useDashboard(workspaceId?: string) {
    return useQuery({
        queryKey: queryKeys.dashboard(workspaceId!),
        queryFn: async () => {
            const response = await dashboardApi.getMetrics(workspaceId!);
            const raw = response.data.data as any; // Backend struct
            return {
                todaySales: raw.today.salesTotal,
                todayPurchases: raw.today.purchasesTotal,
                receivables: raw.customers.totalReceivables,
                payables: raw.suppliers.totalPayables,
                inventoryValue: raw.inventory.inventoryValue,
                lowStockCount: raw.inventory.lowStockCount,
            } as import('../types').DashboardMetrics;
        },
        enabled: Boolean(workspaceId),
    });
}
