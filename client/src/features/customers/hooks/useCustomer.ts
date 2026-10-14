import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { customerApi } from '../api/customerApi';
import { shouldRetryQuery } from '../../../hooks/queryReliability';

export function useCustomer(workspaceId?: string, customerId?: string) {
    return useQuery({
        queryKey: queryKeys.customers.item(workspaceId!, customerId!),
        queryFn: () => customerApi.getCustomer(workspaceId!, customerId!),
        enabled: Boolean(workspaceId && customerId),
        retry: shouldRetryQuery,
    });
}
