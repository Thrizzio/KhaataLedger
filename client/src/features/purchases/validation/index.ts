import { z } from 'zod';

export const purchaseFormSchema = z.object({
    supplierId: z.string().min(1, 'Please select a supplier'),
    purchaseDate: z.string().min(1, 'Purchase date is required'),
    paymentType: z.enum(['CASH', 'CREDIT'], { invalid_type_error: 'Payment type required' }),
    items: z.array(
        z.object({
            inventoryItemId: z.string().min(1, 'Item required'),
            quantity: z.coerce.number().int('Must be whole number').min(1, 'Quantity must be at least 1'),
            purchasePrice: z.coerce.number().positive('Purchase price must be positive')
        })
    ).min(1, 'At least one item is required').refine(
        (items) => {
            const ids = items.map((i) => i.inventoryItemId).filter(id => id.length > 0);
            return new Set(ids).size === ids.length;
        },
        { message: 'Duplicate items detected. Combine quantities instead.' }
    )
});

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;
