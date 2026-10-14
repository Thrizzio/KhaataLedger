import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseApi } from '../api/purchaseApi';
import { showSnackbar } from '../../../lib/snackbar';
import type { CreatePurchasePayload } from '../types';
import { invalidateWorkspaceFinancialData } from '../../../hooks/queryReliability';

export function useCreatePurchase(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreatePurchasePayload) => purchaseApi.createPurchase(workspaceId, payload),
        onSuccess: async () => {
            showSnackbar({ message: 'Purchase recorded successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
        }
    });
}
