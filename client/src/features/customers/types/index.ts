export interface Customer {
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

export interface CustomerListParams {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export interface CustomerListResponse {
    customers: Customer[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CreateCustomerPayload {
    name: string;
    phoneNumber?: string | null;
    email?: string | null;
    address?: string | null;
}

export interface UpdateCustomerPayload extends Partial<CreateCustomerPayload> { }

export interface CustomerLedgerEntry {
    id: string;
    type: string;
    amount: number;
    title: string;
    entryDate: string;
    saleId: string | null;
    customerPaymentId: string | null;
    createdAt: string;
}

export interface CustomerLedgerResponse {
    customer: {
        id: string;
        name: string;
        phoneNumber: string | null;
        email: string | null;
        outstandingBalance: number;
    };
    ledger: CustomerLedgerEntry[];
    totalEntries: number;
}
