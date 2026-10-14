import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { saleApi } from '../api/saleApi';
import type { SaleListParams } from '../types';
import { shouldRetryQuery } from '../../../hooks/queryReliability';

export function useSales(workspaceId?: string, params?: SaleListParams) {
    return useQuery({
        queryKey: [...queryKeys.sales.list(workspaceId!), params],
        queryFn: () => saleApi.getSales(workspaceId!, params!),
        enabled: Boolean(workspaceId && params),
        placeholderData: keepPreviousData,
        retry: shouldRetryQuery,
    });
}
