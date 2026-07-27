export interface PurchaseLineItem {
    id: string;
    purchaseId: string;
    inventoryItemId: string;
    quantity: number;
    purchasePrice: number;
    productName: string;
}

export interface Purchase {
    id: string;
    workspaceId: string;
    supplierId: string;
    createdById: string;
    purchaseDate: string;
    totalAmount: number;
    paymentType: 'CASH' | 'CREDIT';
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    supplier?: { id: string; name: string };
    lineItems?: PurchaseLineItem[];
}

export interface PurchaseListParams {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export interface PurchaseListResponse {
    items: Purchase[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CreatePurchasePayload {
    supplierId: string;
    purchaseDate: string;
    paymentType: 'CASH' | 'CREDIT';
    items: {
        inventoryItemId: string;
        quantity: number;
        purchasePrice: number;
    }[];
}
