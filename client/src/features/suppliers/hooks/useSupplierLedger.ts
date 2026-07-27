import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { supplierApi } from '../api/supplierApi';

export function useSupplierLedger(workspaceId?: string, supplierId?: string) {
    return useQuery({
        queryKey: queryKeys.suppliers.ledger(workspaceId!, supplierId!),
        queryFn: () => supplierApi.getSupplierLedger(workspaceId!, supplierId!),
        enabled: Boolean(workspaceId && supplierId),
    });
}
