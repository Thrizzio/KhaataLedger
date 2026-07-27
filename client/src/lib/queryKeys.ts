/**
 * Centralized query key factory for TanStack Query.
 * Eliminates ad-hoc string arrays across feature hooks.
 */

export const queryKeys = {
    workspace: (id: string) => ['workspace', id] as const,
    dashboard: (wid: string) => ['dashboard', wid] as const,
    activity: (wid: string) => ['activity', wid] as const,
    inventory: {
        all: (wid: string) => ['inventory', wid] as const,
        list: (wid: string) => ['inventory', wid, 'list'] as const,
        item: (wid: string, id: string) => ['inventory', wid, id] as const,
        lowStock: (wid: string) => ['inventory', wid, 'low-stock'] as const,
    },
    customers: {
        list: (wid: string) => ['customers', wid, 'list'] as const,
        item: (wid: string, id: string) => ['customers', wid, id] as const,
        ledger: (wid: string, id: string) => ['customers', wid, id, 'ledger'] as const,
        topDebtors: (wid: string) => ['customers', wid, 'top-debtors'] as const,
    },
    suppliers: {
        list: (wid: string) => ['suppliers', wid, 'list'] as const,
        item: (wid: string, id: string) => ['suppliers', wid, id] as const,
        ledger: (wid: string, id: string) => ['suppliers', wid, id, 'ledger'] as const,
        topPayables: (wid: string) => ['suppliers', wid, 'top-payables'] as const,
    },
    purchases: {
        list: (wid: string) => ['purchases', wid, 'list'] as const,
    },
    sales: {
        list: (wid: string) => ['sales', wid, 'list'] as const,
    },
    payments: {
        customerList: (wid: string) => ['customer-payments', wid, 'list'] as const,
        supplierList: (wid: string) => ['supplier-payments', wid, 'list'] as const,
    },
} as const;
