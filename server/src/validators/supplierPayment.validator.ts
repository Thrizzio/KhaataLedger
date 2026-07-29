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

const VALID_SORT_FIELDS = ['paymentDate', 'createdAt'] as const;

export const supplierPaymentQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    sortBy: z.enum(VALID_SORT_FIELDS).default('paymentDate'),
    order: z.enum(['asc', 'desc']).default('desc'),
});

export type SupplierPaymentQueryInput = z.infer<typeof supplierPaymentQuerySchema>;
