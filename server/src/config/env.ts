import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('15m'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(12),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  TRUST_PROXY: z
    .union([
      z.string().regex(/^\d+$/).transform(Number),
      z.string().transform((val) => {
        if (val === 'true') return 1;
        if (val === 'false') return false;
        return val;
      }),
      z.number(),
      z.boolean(),
    ])
    .default(1),
});

export const env = envSchema.parse(process.env);
