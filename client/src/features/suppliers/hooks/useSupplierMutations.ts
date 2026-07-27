import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { supplierApi } from '../api/supplierApi';
import { showSnackbar } from '../../../lib/snackbar';
import type { CreateSupplierPayload, UpdateSupplierPayload } from '../types';

export function useSupplierMutations(workspaceId: string) {
    const queryClient = useQueryClient();

    const invalidateClientData = (supplierId?: string) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.list(workspaceId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.topPayables(workspaceId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(workspaceId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity(workspaceId) });

        if (supplierId) {
            queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.item(workspaceId, supplierId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.ledger(workspaceId, supplierId) });
        }
    };

    const createMutation = useMutation({
        mutationFn: (payload: CreateSupplierPayload) => supplierApi.createSupplier(workspaceId, payload),
        onSuccess: () => {
            showSnackbar({ message: 'Supplier created successfully', severity: 'success' });
            invalidateClientData();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierPayload }) =>
            supplierApi.updateSupplier(workspaceId, id, payload),
        onSuccess: (data, variables) => {
            showSnackbar({ message: 'Supplier updated successfully', severity: 'success' });
            invalidateClientData(variables.id);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => supplierApi.deleteSupplier(workspaceId, id),
        onSuccess: () => {
            showSnackbar({ message: 'Supplier removed successfully', severity: 'success' });
            invalidateClientData();
        }
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
}
