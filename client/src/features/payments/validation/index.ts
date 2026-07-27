import { z } from 'zod';

export const customerPaymentSchema = z.object({
    customerId: z.string().min(1, 'Please select a customer'),
    paymentDate: z.string().min(1, 'Date is required'),
    amount: z.coerce.number().positive('Amount must be greater than zero'),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
});

export type CustomerPaymentFormValues = z.infer<typeof customerPaymentSchema>;

export const supplierPaymentSchema = z.object({
    supplierId: z.string().min(1, 'Please select a supplier'),
    paymentDate: z.string().min(1, 'Date is required'),
    amount: z.coerce.number().positive('Amount must be greater than zero'),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
});

export type SupplierPaymentFormValues = z.infer<typeof supplierPaymentSchema>;
