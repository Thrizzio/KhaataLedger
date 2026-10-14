import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { supplierApi } from '../api/supplierApi';
import { shouldRetryQuery } from '../../../hooks/queryReliability';

export function useSupplier(workspaceId?: string, supplierId?: string) {
    return useQuery({
        queryKey: queryKeys.suppliers.item(workspaceId!, supplierId!),
        queryFn: () => supplierApi.getSupplier(workspaceId!, supplierId!),
        enabled: Boolean(workspaceId && supplierId),
        retry: shouldRetryQuery,
    });
}
