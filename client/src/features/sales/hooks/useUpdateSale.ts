import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saleApi } from '../api/saleApi';
import type { CreateSalePayload } from '../types';
import { showSnackbar } from '../../../lib/snackbar';
import { invalidateWorkspaceFinancialData } from '../../../hooks/queryReliability';

export const useUpdateSale = (workspaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ saleId, payload }: { saleId: string; payload: Omit<CreateSalePayload, 'customerId' | 'paymentType'> }) =>
            saleApi.updateSale(workspaceId, saleId, payload),
        onSuccess: async () => {
            showSnackbar({ message: 'Sale updated successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
            queryClient.invalidateQueries({ queryKey: ['auditLogs', workspaceId] });
        }
    });
};
