import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '../api/paymentApi';
import { showSnackbar } from '../../../lib/snackbar';
import type { CreateCustomerPaymentPayload, CreateSupplierPaymentPayload } from '../types';
import { invalidateWorkspaceFinancialData } from '../../../hooks/queryReliability';

export function useCreateCustomerPayment(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateCustomerPaymentPayload) => paymentApi.createCustomerPayment(workspaceId, payload),
        onSuccess: async () => {
            showSnackbar({ message: 'Customer payment recorded successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
        }
    });
}

export function useCreateSupplierPayment(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateSupplierPaymentPayload) => paymentApi.createSupplierPayment(workspaceId, payload),
        onSuccess: async () => {
            showSnackbar({ message: 'Supplier payment recorded successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
        }
    });
}
