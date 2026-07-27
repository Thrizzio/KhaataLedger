import { z } from 'zod';

export const createSupplierPaymentSchema = z.object({
    supplierId: z.string().uuid('supplierId must be a valid UUID'),
    paymentDate: z
        .string()
        .datetime({ offset: true })
        .or(z.string().date())
        .transform((v) => new Date(v)),
    amount: z.number().positive('Amount must be greater than zero'),
    notes: z.string().max(500).optional(),
});

export type CreateSupplierPaymentInput = z.infer<typeof createSupplierPaymentSchema>;
