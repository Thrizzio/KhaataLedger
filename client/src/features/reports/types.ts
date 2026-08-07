export type ReportPeriod = 'today' | 'week' | 'month';

export interface Metric {
    label: string;
    value: string;
    status?: string;
}

export interface Growth {
    value: number;
    direction: "up" | "down";
}

export interface ProductList {
    product: string;
    quantity: string;
}

export interface RevenueProductList {
    product: string;
    revenue: string;
}

export interface CustomerList {
    name: string;
    amount: string;
}

export interface SupplierList {
    name: string;
    amount: string;
}

export interface PurchaseRecordList {
    supplier: string;
    date: string;
    amount: string;
}

export interface ReportSection {
    metrics: Metric[];
}

export interface SalesReportSection extends ReportSection {
    growth?: Growth;
    bestSellingProducts?: ProductList[];
    worstSellingProducts?: ProductList[];
    topCustomers?: CustomerList[];
}

export interface CustomerReportSection extends ReportSection {
    topCustomers?: CustomerList[];
    highestOutstandingCustomers?: CustomerList[];
}

export interface SupplierReportSection extends ReportSection {
    topSuppliersByPurchaseValue?: SupplierList[];
    topSuppliersByPurchaseCount?: SupplierList[];
}

export interface PurchaseReportSection extends ReportSection {
    mostPurchasedProducts?: ProductList[];
    largestPurchases?: PurchaseRecordList[];
}

export interface PaymentBreakdown {
    source: string;
    amount: string;
}

export interface TransactionList {
    date: string;
    source?: string;
    supplier?: string;
    amount: string;
}

export interface CashFlowReportSection extends ReportSection {
    paymentBreakdown?: PaymentBreakdown[];
    largestInflows?: TransactionList[];
    largestOutflows?: TransactionList[];
}

export interface InventoryLowStockList {
    product: string;
    stock: string;
    reorderLevel: string;
}

export interface InventoryOutList {
    product: string;
}

export interface InventoryHighList {
    product: string;
    stock: string;
}

export interface InventoryReportSection extends ReportSection {
    lowStockProducts?: InventoryLowStockList[];
    outOfStockProducts?: InventoryOutList[];
    highestStockProducts?: InventoryHighList[];
}

export interface ProfitabilityReportSection extends ReportSection {
    highestRevenueProducts?: RevenueProductList[];
    topCustomers?: CustomerList[];
}

export interface ReportsData {
    period: ReportPeriod;
    generatedAt: string;
    sections: {
        sales: SalesReportSection;
        inventory: InventoryReportSection;
        customers: CustomerReportSection;
        suppliers: SupplierReportSection;
        purchases: PurchaseReportSection;
        profitability: ProfitabilityReportSection;
        cashFlow: CashFlowReportSection;
    };
}
