import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { customerApi } from '../api/customerApi';
import type { CustomerListParams } from '../types';

export function useCustomers(workspaceId?: string, params?: CustomerListParams) {
    return useQuery({
        queryKey: [...queryKeys.customers.list(workspaceId!), params],
        queryFn: () => customerApi.getCustomers(workspaceId!, params!),
        enabled: Boolean(workspaceId && params),
        placeholderData: keepPreviousData,
    });
}
