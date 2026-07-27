import { z } from 'zod';

export const createPurchaseSchema = z.object({
    supplierId: z.string().uuid('supplierId must be a valid UUID'),
    purchaseDate: z.string().datetime({ offset: true }).or(z.string().date()).transform((v) => new Date(v)),
    paymentType: z.enum(['CASH', 'CREDIT']).default('CASH'),
    items: z
        .array(
            z.object({
                inventoryItemId: z.string().uuid('inventoryItemId must be a valid UUID'),
                quantity: z.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1'),
                purchasePrice: z.number().positive('Purchase price must be positive'),
            }),
        )
        .min(1, 'At least one item is required')
        .refine(
            (items) => new Set(items.map((i) => i.inventoryItemId)).size === items.length,
            { message: 'Duplicate inventoryItemId in items: combine quantities into one line' },
        ),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;

const VALID_SORT_FIELDS = ['purchaseDate', 'createdAt'] as const;

export const purchaseQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    sortBy: z.enum(VALID_SORT_FIELDS).default('purchaseDate'),
    order: z.enum(['asc', 'desc']).default('desc'),
});

export type PurchaseQueryInput = z.infer<typeof purchaseQuerySchema>;
