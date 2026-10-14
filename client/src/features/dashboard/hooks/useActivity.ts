import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { dashboardApi } from '../api/dashboardApi';
import { shouldRetryQuery } from '../../../hooks/queryReliability';

export function useActivity(workspaceId?: string) {
    return useQuery({
        queryKey: queryKeys.activity(workspaceId!),
        queryFn: async () => {
            const response = await dashboardApi.getActivity(workspaceId!);
            const { activity } = response.data.data as any;
            return activity.map((raw: any) => {
                let mappedType = 'SALE';
                if (raw.type === 'SALE') mappedType = 'SALE';
                if (raw.type === 'PURCHASE') mappedType = 'PURCHASE';
                if (raw.type === 'CUSTOMER_PAYMENT') mappedType = 'INCOME';
                if (raw.type === 'SUPPLIER_PAYMENT') mappedType = 'EXPENSE';

                return {
                    id: raw.referenceId,
                    type: mappedType,
                    title: raw.title,
                    amount: raw.amount,
                    transactionDate: raw.timestamp
                };
            }) as import('../types').ActivityItem[];
        },
        enabled: Boolean(workspaceId),
        retry: shouldRetryQuery,
    });
}
