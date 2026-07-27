export interface InventoryItem {
    id: string;
    workspaceId: string;
    name: string;
    sku: string | null;
    unit: string | null;
    currentStock: number;
    minStockLevel: number;
    defaultPurchasePrice: number | null;
    defaultSellingPrice: number;
    createdAt: string;
    updatedAt: string;
}

export interface InventoryListParams {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export interface InventoryListResponse {
    items: InventoryItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CreateInventoryPayload {
    name: string;
    sku?: string | null;
    unit?: string | null;
    defaultSellingPrice: number;
}

export interface UpdateInventoryPayload extends Partial<CreateInventoryPayload> { }
