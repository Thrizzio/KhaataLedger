import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { supplierApi } from '../api/supplierApi';
import type { SupplierListParams } from '../types';

export function useSuppliers(workspaceId?: string, params?: SupplierListParams) {
    return useQuery({
        queryKey: [...queryKeys.suppliers.list(workspaceId!), params],
        queryFn: () => supplierApi.getSuppliers(workspaceId!, params!),
        enabled: Boolean(workspaceId && params),
        placeholderData: keepPreviousData,
    });
}
