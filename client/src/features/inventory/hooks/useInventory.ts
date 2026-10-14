import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { inventoryApi } from '../api/inventoryApi';
import type { InventoryListParams } from '../types';
import { shouldRetryQuery } from '../../../hooks/queryReliability';

export function useInventory(workspaceId?: string, params?: InventoryListParams) {
    return useQuery({
        queryKey: [...queryKeys.inventory.list(workspaceId!), params],
        queryFn: () => inventoryApi.getInventory(workspaceId!, params!),
        enabled: Boolean(workspaceId && params),
        placeholderData: keepPreviousData,
        retry: shouldRetryQuery,
    });
}
