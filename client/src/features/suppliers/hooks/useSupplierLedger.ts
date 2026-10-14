import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { supplierApi } from '../api/supplierApi';
import { shouldRetryQuery } from '../../../hooks/queryReliability';

export function useSupplierLedger(workspaceId?: string, supplierId?: string) {
    return useQuery({
        queryKey: queryKeys.suppliers.ledger(workspaceId!, supplierId!),
        queryFn: () => supplierApi.getSupplierLedger(workspaceId!, supplierId!),
        enabled: Boolean(workspaceId && supplierId),
        retry: shouldRetryQuery,
    });
}
