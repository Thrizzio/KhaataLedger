import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required and must be at least 2 characters'),
  email: z.string().trim().email('Valid email is required').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((value) => value.trim().length > 0, 'Password cannot be blank'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Valid email is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});
