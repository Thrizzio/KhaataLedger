import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { customerApi } from '../api/customerApi';
import { showSnackbar } from '../../../lib/snackbar';
import type { CreateCustomerPayload, UpdateCustomerPayload } from '../types';
import { ApiError } from '../../../api/apiError';

export function useCustomerMutations(workspaceId: string) {
    const queryClient = useQueryClient();

    const invalidateClientData = (customerId?: string) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.customers.list(workspaceId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.customers.topDebtors(workspaceId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(workspaceId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity(workspaceId) });

        if (customerId) {
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.item(workspaceId, customerId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.ledger(workspaceId, customerId) });
        }
    };

    const createMutation = useMutation({
        mutationFn: (payload: CreateCustomerPayload) => customerApi.createCustomer(workspaceId, payload),
        onSuccess: () => {
            showSnackbar({ message: 'Customer created successfully', severity: 'success' });
            invalidateClientData();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) =>
            customerApi.updateCustomer(workspaceId, id, payload),
        onSuccess: (data, variables) => {
            showSnackbar({ message: 'Customer updated successfully', severity: 'success' });
            invalidateClientData(variables.id);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => customerApi.deleteCustomer(workspaceId, id),
        onSuccess: () => {
            showSnackbar({ message: 'Customer removed successfully', severity: 'success' });
            invalidateClientData();
        }
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
}
