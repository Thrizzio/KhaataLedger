import { z } from 'zod';

export const customerFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
    phoneNumber: z.string().max(30, 'Phone too long').nullable().optional().transform(v => v === '' ? null : v),
    email: z.union([z.literal(''), z.string().email('Invalid email format')]).nullable().optional().transform(v => v === '' ? null : v),
    address: z.string().max(500, 'Address too long').nullable().optional().transform(v => v === '' ? null : v),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
