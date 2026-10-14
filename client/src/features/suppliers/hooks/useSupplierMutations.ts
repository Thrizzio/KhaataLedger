import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierApi } from '../api/supplierApi';
import { showSnackbar } from '../../../lib/snackbar';
import type { CreateSupplierPayload, UpdateSupplierPayload } from '../types';
import { invalidateWorkspaceFinancialData } from '../../../hooks/queryReliability';

export function useSupplierMutations(workspaceId: string) {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (payload: CreateSupplierPayload) => supplierApi.createSupplier(workspaceId, payload),
        onSuccess: async () => {
            showSnackbar({ message: 'Supplier created successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierPayload }) =>
            supplierApi.updateSupplier(workspaceId, id, payload),
        onSuccess: async () => {
            showSnackbar({ message: 'Supplier updated successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => supplierApi.deleteSupplier(workspaceId, id),
        onSuccess: async () => {
            showSnackbar({ message: 'Supplier removed successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
        }
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
}
