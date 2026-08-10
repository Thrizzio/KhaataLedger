import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

let dbUrl = env.DATABASE_URL;
if (!dbUrl.includes('connect_timeout')) {
  dbUrl += dbUrl.includes('?') ? '&connect_timeout=30' : '?connect_timeout=30';
}
if (!dbUrl.includes('pool_timeout')) {
  dbUrl += '&pool_timeout=30';
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});
