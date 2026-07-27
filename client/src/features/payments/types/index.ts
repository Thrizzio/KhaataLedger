export interface CreateCustomerPaymentPayload {
    customerId: string;
    paymentDate: string;
    amount: number;
    notes?: string;
}

export interface CreateSupplierPaymentPayload {
    supplierId: string;
    paymentDate: string;
    amount: number;
    notes?: string;
}
