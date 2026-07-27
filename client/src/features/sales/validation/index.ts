import { z } from 'zod';

export const saleFormSchema = z.object({
    customerId: z.string().optional(),
    saleDate: z.string().min(1, 'Sale date is required'),
    paymentType: z.enum(['CASH', 'CREDIT'], { invalid_type_error: 'Payment type required' }),
    items: z.array(
        z.object({
            inventoryItemId: z.string().min(1, 'Item required'),
            quantity: z.coerce.number().int('Must be integer').min(1, 'Quantity must be at least 1'),
            sellingPrice: z.coerce.number().positive('Selling price must be positive'),
        })
    ).min(1, 'At least one item is required').refine(
        (items) => {
            const ids = items.map((i) => i.inventoryItemId).filter(id => id.length > 0);
            return new Set(ids).size === ids.length;
        },
        { message: 'Duplicate items detected. Combine quantities instead.' }
    )
}).superRefine((data, ctx) => {
    // Backend condition: CREDIT requires customerId
    if (data.paymentType === 'CREDIT' && !data.customerId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['customerId'],
            message: 'Customer is required for CREDIT sales',
        });
    }
});

export type SaleFormValues = z.infer<typeof saleFormSchema>;
