import { z } from 'zod';

// POST /khata — createdById is taken from the authenticated user, never the body.
export const createKhataSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  contactNumber: z.string().optional().default(''),
  title: z.string().min(1, 'Title is required'),
  initialAmount: z.coerce.number().min(0, 'Initial amount must be 0 or greater'),
});

export type CreateKhataInput = z.infer<typeof createKhataSchema>;

export const updateKhataSchema = z.object({
  customerName: z.string().min(1).optional(),
  contactNumber: z.string().optional(),
  initialAmount: z.coerce.number().min(0).optional(),
});

export type UpdateKhataInput = z.infer<typeof updateKhataSchema>;

// POST /khata/:id/entries — createdById is taken from the authenticated user.
export const addKhataEntrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.coerce.number().min(0, 'Amount must be 0 or greater'),
  type: z.enum(['CREDIT', 'PAYMENT'], {
    errorMap: () => ({ message: 'Type must be CREDIT or PAYMENT' }),
  }),
  entryDate: z.string().min(1, 'Entry date is required'),
});

export type AddKhataEntryInput = z.infer<typeof addKhataEntrySchema>;
