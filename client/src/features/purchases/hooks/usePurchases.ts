import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { purchaseApi } from '../api/purchaseApi';
import type { PurchaseListParams } from '../types';
import { shouldRetryQuery } from '../../../hooks/queryReliability';

export function usePurchases(workspaceId?: string, params?: PurchaseListParams) {
    return useQuery({
        queryKey: [...queryKeys.purchases.list(workspaceId!), params],
        queryFn: () => purchaseApi.getPurchases(workspaceId!, params!),
        enabled: Boolean(workspaceId && params),
        placeholderData: keepPreviousData,
        retry: shouldRetryQuery,
    });
}
