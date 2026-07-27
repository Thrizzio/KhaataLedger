import { z } from 'zod';

export const inventoryFormSchema = z.object({
    name: z.string().min(1, 'Item name is required').max(100, 'Name must be under 100 characters'),
    sku: z.string().max(50, 'SKU must be under 50 characters').nullable().optional().transform(v => v === '' ? null : v),
    unit: z.string().max(20, 'Unit must be under 20 characters').nullable().optional().transform(v => v === '' ? null : v),
    defaultSellingPrice: z.number().min(0, 'Selling price cannot be negative'),
});

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;
