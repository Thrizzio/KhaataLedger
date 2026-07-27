export interface Supplier {
    id: string;
    workspaceId: string;
    name: string;
    phoneNumber: string | null;
    email: string | null;
    address: string | null;
    outstandingBalance: number;
    createdAt: string;
    updatedAt: string;
}

export interface SupplierListParams {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export interface SupplierListResponse {
    items: Supplier[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CreateSupplierPayload {
    name: string;
    phoneNumber?: string | null;
    email?: string | null;
    address?: string | null;
}

export interface UpdateSupplierPayload extends Partial<CreateSupplierPayload> { }

export interface SupplierLedgerEntry {
    type: 'PURCHASE' | 'PAYMENT';
    referenceId: string;
    date: string;
    amount: number;
    paymentType: string | null;
    title: string;
    lineItems: any[];
}

export interface SupplierLedgerResponse {
    supplier: {
        id: string;
        name: string;
        phoneNumber: string | null;
        email: string | null;
        outstandingBalance: number;
    };
    ledger: SupplierLedgerEntry[];
    totalEntries: number;
}
