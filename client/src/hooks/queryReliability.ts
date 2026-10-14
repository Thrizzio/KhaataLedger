import type { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/apiError';
import { queryKeys } from '../lib/queryKeys';

/** Retry only transient failures; validation, conflicts, and missing resources are actionable. */
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
    const status = error instanceof ApiError ? error.status : 0;
    if (status >= 400 && status < 500) return false;
    if (status >= 500 || status === 0) return failureCount < 2;
    return false;
};

/** Financial writes affect several dashboard, ledger, list, and report projections. */
export const invalidateWorkspaceFinancialData = async (
    queryClient: QueryClient,
    workspaceId: string,
): Promise<void> => {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.activity(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory.lowStock(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: ['customers', workspaceId] }),
        queryClient.invalidateQueries({ queryKey: ['suppliers', workspaceId] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.purchases.list(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.sales.list(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.customerList(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.supplierList(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: ['reports', workspaceId] }),
    ]);
};
