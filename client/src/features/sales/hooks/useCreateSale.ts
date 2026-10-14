import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saleApi } from '../api/saleApi';
import { showSnackbar } from '../../../lib/snackbar';
import type { CreateSalePayload } from '../types';
import { invalidateWorkspaceFinancialData } from '../../../hooks/queryReliability';

export function useCreateSale(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateSalePayload) => saleApi.createSale(workspaceId, payload),
        onSuccess: async () => {
            showSnackbar({ message: 'Sale recorded successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
        }
    });
}
