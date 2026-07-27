import { z } from 'zod';

export const createCustomerPaymentSchema = z.object({
    customerId: z.string().uuid('customerId must be a valid UUID'),
    paymentDate: z
        .string()
        .datetime({ offset: true })
        .or(z.string().date())
        .transform((v) => new Date(v)),
    amount: z.number().positive('Amount must be greater than zero'),
    notes: z.string().max(500).optional(),
});

export type CreateCustomerPaymentInput = z.infer<typeof createCustomerPaymentSchema>;
