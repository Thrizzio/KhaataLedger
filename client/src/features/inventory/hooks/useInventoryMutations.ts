import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { showSnackbar } from '../../../lib/snackbar';
import type { CreateInventoryPayload, UpdateInventoryPayload } from '../types';
import { ApiError } from '../../../api/apiError';
import { invalidateWorkspaceFinancialData } from '../../../hooks/queryReliability';

export function useInventoryMutations(workspaceId: string) {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (payload: CreateInventoryPayload) => inventoryApi.createInventory(workspaceId, payload),
        onSuccess: async () => {
            showSnackbar({ message: 'Inventory item added successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
        },
        onError: (error) => {
            if (error instanceof ApiError) return; // SnackBar global interceptor handles it
            showSnackbar({ message: 'Failed to add inventory item', severity: 'error' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateInventoryPayload }) =>
            inventoryApi.updateInventory(workspaceId, id, payload),
        onSuccess: async () => {
            showSnackbar({ message: 'Inventory item updated successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
        },
        onError: (error) => {
            if (error instanceof ApiError) return;
            showSnackbar({ message: 'Failed to update inventory item', severity: 'error' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => inventoryApi.deleteInventory(workspaceId, id),
        onSuccess: async () => {
            showSnackbar({ message: 'Item removed successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
        },
        onError: (error) => {
            if (error instanceof ApiError) return;
            showSnackbar({ message: 'Failed to delete item', severity: 'error' });
        }
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
}
