import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { dashboardApi } from '../api/dashboardApi';

export function useLowStock(workspaceId?: string) {
    return useQuery({
        queryKey: queryKeys.inventory.lowStock(workspaceId!),
        queryFn: async () => {
            const response = await dashboardApi.getLowStock(workspaceId!);
            const { items, threshold } = response.data.data!;
            return items.map((item: any) => ({
                id: item.id,
                name: item.name,
                sku: item.sku,
                currentStock: item.currentStock,
                minStockLevel: threshold,
                purchasePrice: Number(item.lastPurchasePrice || 0)
            })) as import('../types').LowStockItem[];
        },
        enabled: Boolean(workspaceId),
    });
}
