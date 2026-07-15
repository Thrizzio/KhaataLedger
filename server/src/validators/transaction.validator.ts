import { z } from 'zod';

// Validation rules mirror the Add Transaction form on the client:
// title, amount, type and transactionDate are required; description is optional.
export const updateTransactionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  amount: z.number({ invalid_type_error: 'Amount must be a number' }).min(0, 'Amount must be 0 or greater'),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
  }),
  transactionDate: z.string().min(1, 'Transaction date is required'),
});

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
