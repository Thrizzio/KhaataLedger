import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../api/customerApi';
import { showSnackbar } from '../../../lib/snackbar';
import type { CreateCustomerPayload, UpdateCustomerPayload } from '../types';
import { invalidateWorkspaceFinancialData } from '../../../hooks/queryReliability';

export function useCustomerMutations(workspaceId: string) {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (payload: CreateCustomerPayload) => customerApi.createCustomer(workspaceId, payload),
        onSuccess: async () => {
            showSnackbar({ message: 'Customer created successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) =>
            customerApi.updateCustomer(workspaceId, id, payload),
        onSuccess: async () => {
            showSnackbar({ message: 'Customer updated successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => customerApi.deleteCustomer(workspaceId, id),
        onSuccess: async () => {
            showSnackbar({ message: 'Customer removed successfully', severity: 'success' });
            await invalidateWorkspaceFinancialData(queryClient, workspaceId);
        }
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
}
