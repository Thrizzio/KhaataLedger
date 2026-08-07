export type ReportPeriod = 'today' | 'week' | 'month';

export interface Metric {
    label: string;
    value: string;
}

export interface Growth {
    value: number;
    direction: "up" | "down";
}

export interface ProductList {
    product: string;
    quantity: string;
}

export interface CustomerList {
    name: string;
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

export interface ReportsData {
    period: ReportPeriod;
    generatedAt: string;
    sections: {
        sales: SalesReportSection;
        inventory: ReportSection;
        customers: ReportSection;
        suppliers: ReportSection;
        purchases: ReportSection;
        profitability: ReportSection;
        cashFlow: ReportSection;
    };
}
