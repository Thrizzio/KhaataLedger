import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { purchaseApi } from '../api/purchaseApi';
import { showSnackbar } from '../../../lib/snackbar';
import type { CreatePurchasePayload } from '../types';

export function useCreatePurchase(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreatePurchasePayload) => purchaseApi.createPurchase(workspaceId, payload),
        onSuccess: () => {
            showSnackbar({ message: 'Purchase recorded successfully', severity: 'success' });

            // Global cache invalidation for relational dependencies
            queryClient.invalidateQueries({ queryKey: queryKeys.purchases.list(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.list(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.topPayables(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.activity(workspaceId) });

            // Invalidate specifically requested supplier ledger boundaries forcing the specific node to re-hydrate timeline natively 
            // This ensures detailed nested views are robustly tracked
            queryClient.resetQueries({ queryKey: ['suppliers', workspaceId] });
        }
    });
}
