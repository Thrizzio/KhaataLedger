import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { paymentApi } from '../api/paymentApi';
import { showSnackbar } from '../../../lib/snackbar';
import type { CreateCustomerPaymentPayload, CreateSupplierPaymentPayload } from '../types';

export function useCreateCustomerPayment(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateCustomerPaymentPayload) => paymentApi.createCustomerPayment(workspaceId, payload),
        onSuccess: (data, variables) => {
            showSnackbar({ message: 'Customer payment recorded successfully', severity: 'success' });

            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.list(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.topDebtors(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.activity(workspaceId) });
            queryClient.resetQueries({ queryKey: ['customers', workspaceId] });
        }
    });
}

export function useCreateSupplierPayment(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateSupplierPaymentPayload) => paymentApi.createSupplierPayment(workspaceId, payload),
        onSuccess: (data, variables) => {
            showSnackbar({ message: 'Supplier payment recorded successfully', severity: 'success' });

            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.list(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.topPayables(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.activity(workspaceId) });
            queryClient.resetQueries({ queryKey: ['suppliers', workspaceId] });
        }
    });
}
