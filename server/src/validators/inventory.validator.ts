import { z } from 'zod';

export const createInventorySchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(200, 'Name too long'),
    sku: z.string().trim().max(100, 'SKU too long').optional(),
    unit: z.string().trim().max(50, 'Unit too long').optional(),
    defaultSellingPrice: z
        .number({ invalid_type_error: 'Price must be a number' })
        .min(0, 'Price must be 0 or greater'),
});

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;

export const updateInventorySchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(200, 'Name too long').optional(),
    sku: z.string().trim().max(100, 'SKU too long').optional().nullable(),
    unit: z.string().trim().max(50, 'Unit too long').optional().nullable(),
    defaultSellingPrice: z
        .number({ invalid_type_error: 'Price must be a number' })
        .min(0, 'Price must be 0 or greater')
        .optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});

export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;

const VALID_SORT_FIELDS = ['name', 'sku', 'defaultSellingPrice', 'createdAt'] as const;

export const queryInventorySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(5000).default(20),
    search: z.string().optional(),
    sortBy: z.enum(VALID_SORT_FIELDS).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryInventoryInput = z.infer<typeof queryInventorySchema>;
