import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { paymentApi } from '../api/paymentApi';

export function useCustomerPayments(workspaceId: string, params: any) {
    return useQuery({
        queryKey: [...queryKeys.activity(workspaceId), 'customerPayments', params],
        queryFn: () => paymentApi.getCustomerPayments(workspaceId, params),
        enabled: Boolean(workspaceId),
    });
}

export function useSupplierPayments(workspaceId: string, params: any) {
    return useQuery({
        queryKey: [...queryKeys.activity(workspaceId), 'supplierPayments', params],
        queryFn: () => paymentApi.getSupplierPayments(workspaceId, params),
        enabled: Boolean(workspaceId),
    });
}
