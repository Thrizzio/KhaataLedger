import { z } from 'zod';

export const createSaleSchema = z
    .object({
        customerId: z.string().uuid('customerId must be a valid UUID').optional(),
        saleDate: z
            .string()
            .datetime({ offset: true })
            .or(z.string().date())
            .transform((v) => new Date(v)),
        paymentType: z.enum(['CASH', 'CREDIT']),
        items: z
            .array(
                z.object({
                    inventoryItemId: z.string().uuid('inventoryItemId must be a valid UUID'),
                    quantity: z
                        .number()
                        .int('Quantity must be an integer')
                        .min(1, 'Quantity must be at least 1'),
                    sellingPrice: z.number().min(0, 'Selling price must be 0 or greater'),
                }),
            )
            .min(1, 'At least one item is required')
            .refine(
                (items) => new Set(items.map((i) => i.inventoryItemId)).size === items.length,
                { message: 'Duplicate inventoryItemId: combine quantities into one line' },
            ),
    })
    .superRefine((data, ctx) => {
        if (data.paymentType === 'CREDIT' && !data.customerId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['customerId'],
                message: 'customerId is required for CREDIT sales',
            });
        }
    });

export type CreateSaleInput = z.infer<typeof createSaleSchema>;

export const updateSaleSchema = z.object({
    saleDate: z
        .string()
        .datetime({ offset: true })
        .or(z.string().date())
        .transform((v) => new Date(v)),
    items: z
        .array(
            z.object({
                inventoryItemId: z.string().uuid('inventoryItemId must be a valid UUID'),
                quantity: z
                    .number()
                    .int('Quantity must be an integer')
                    .min(1, 'Quantity must be at least 1'),
                sellingPrice: z.number().min(0, 'Selling price must be 0 or greater'),
            }),
        )
        .min(1, 'At least one item is required')
        .refine(
            (items) => new Set(items.map((i) => i.inventoryItemId)).size === items.length,
            { message: 'Duplicate inventoryItemId: combine quantities into one line' },
        ),
});

export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;

const VALID_SORT_FIELDS = ['saleDate', 'createdAt'] as const;

export const saleQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    sortBy: z.enum(VALID_SORT_FIELDS).default('saleDate'),
    order: z.enum(['asc', 'desc']).default('desc'),
});

export type SaleQueryInput = z.infer<typeof saleQuerySchema>;
