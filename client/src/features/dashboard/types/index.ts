// DTO for GET /workspaces/:workspaceId/dashboard
export interface DashboardMetrics {
    todaySales: number;
    todayPurchases: number;
    receivables: number;
    payables: number;
    inventoryValue: number;
    lowStockCount: number;
}

export interface DashboardApiResponse {
    today: { salesTotal: number; purchasesTotal: number };
    customers: { totalReceivables: number };
    suppliers: { totalPayables: number };
    inventory: { inventoryValue: number; lowStockCount: number };
}

// DTO for GET /workspaces/:workspaceId/activity
export interface ActivityItem {
    id: string;
    type: 'INCOME' | 'EXPENSE' | 'SALE' | 'PURCHASE' | 'PAYMENT';
    title: string;
    amount: number;
    transactionDate: string;
}

// DTO for GET /workspaces/:workspaceId/inventory/low-stock
export interface LowStockItem {
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    minStockLevel: number;
    purchasePrice: number;
}
