import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { customerApi } from '../api/customerApi';
import { shouldRetryQuery } from '../../../hooks/queryReliability';

export function useCustomerLedger(workspaceId?: string, customerId?: string) {
    return useQuery({
        queryKey: queryKeys.customers.ledger(workspaceId!, customerId!),
        queryFn: () => customerApi.getCustomerLedger(workspaceId!, customerId!),
        enabled: Boolean(workspaceId && customerId),
        retry: shouldRetryQuery,
    });
}
