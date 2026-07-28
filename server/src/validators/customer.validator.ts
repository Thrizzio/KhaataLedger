import { z } from 'zod';

export const createCustomerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
    phoneNumber: z.string().max(30, 'Phone too long').optional(),
    email: z.string().email('Invalid email').max(200).optional(),
    address: z.string().max(500, 'Address too long').optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = z
    .object({
        name: z.string().min(1, 'Name is required').max(200, 'Name too long').optional(),
        phoneNumber: z.string().max(30, 'Phone too long').optional().nullable(),
        email: z.string().email('Invalid email').max(200).optional().nullable(),
        address: z.string().max(500, 'Address too long').optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided',
    });

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

const VALID_SORT_FIELDS = ['name', 'phoneNumber', 'createdAt'] as const;

export const customerQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(5000).default(20),
    search: z.string().optional(),
    sortBy: z.enum(VALID_SORT_FIELDS).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
});

export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;
