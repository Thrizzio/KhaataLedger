export interface SaleLineItem {
    id: string;
    saleId: string;
    inventoryItemId: string;
    quantity: number;
    sellingPrice: number;
    productName: string;
}

export interface Sale {
    id: string;
    workspaceId: string;
    customerId: string | null;
    createdById: string;
    saleDate: string;
    totalAmount: number;
    paymentType: 'CASH' | 'CREDIT';
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    customer?: { id: string; name: string } | null;
    lineItems?: SaleLineItem[];
}

export interface SaleListParams {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export interface SaleListResponse {
    items: Sale[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CreateSalePayload {
    customerId?: string; // Optional for CASH
    saleDate: string;
    paymentType: 'CASH' | 'CREDIT';
    items: {
        inventoryItemId: string;
        quantity: number;
        sellingPrice: number;
    }[];
}
