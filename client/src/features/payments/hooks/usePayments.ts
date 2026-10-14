import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { paymentApi } from '../api/paymentApi';
import { shouldRetryQuery } from '../../../hooks/queryReliability';

export function useCustomerPayments(workspaceId: string, params: any) {
    return useQuery({
        queryKey: [...queryKeys.payments.customerList(workspaceId), params],
        queryFn: () => paymentApi.getCustomerPayments(workspaceId, params),
        enabled: Boolean(workspaceId),
        retry: shouldRetryQuery,
    });
}

export function useSupplierPayments(workspaceId: string, params: any) {
    return useQuery({
        queryKey: [...queryKeys.payments.supplierList(workspaceId), params],
        queryFn: () => paymentApi.getSupplierPayments(workspaceId, params),
        enabled: Boolean(workspaceId),
        retry: shouldRetryQuery,
    });
}
