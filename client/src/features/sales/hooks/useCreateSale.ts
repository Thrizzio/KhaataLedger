import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { saleApi } from '../api/saleApi';
import { showSnackbar } from '../../../lib/snackbar';
import type { CreateSalePayload } from '../types';

export function useCreateSale(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateSalePayload) => saleApi.createSale(workspaceId, payload),
        onSuccess: (newSale) => {
            showSnackbar({ message: 'Sale recorded successfully', severity: 'success' });

            // Global cache invalidation for relational dependencies
            queryClient.invalidateQueries({ queryKey: queryKeys.sales.list(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.list(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.topDebtors(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(workspaceId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.activity(workspaceId) });

            // Invalidate specifically requested customer ledger boundaries if evaluating specific timeline elements deeply
            if (newSale.customerId) {
                queryClient.resetQueries({ queryKey: ['customers', workspaceId] });
            }
        }
    });
}
