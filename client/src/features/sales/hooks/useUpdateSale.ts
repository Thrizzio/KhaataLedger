import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { saleApi } from '../api/saleApi';
import { showSnackbar } from '../../../lib/snackbar';
import type { CreateSalePayload } from '../types';

export const useUpdateSale = (workspaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ saleId, payload }: { saleId: string; payload: Omit<CreateSalePayload, 'customerId' | 'paymentType'> }) =>
            saleApi.updateSale(workspaceId, saleId, payload),
        onSuccess: () => {
            showSnackbar({ message: 'Sale updated successfully', severity: 'success' });
            queryClient.invalidateQueries({ queryKey: queryKeys.sales.list(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.list(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.topDebtors(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.activity(workspaceId) });
            queryClient.invalidateQueries({ queryKey: ['auditLogs', workspaceId] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update sale';
            showSnackbar({ message, severity: 'error' });
        }
    });
};
