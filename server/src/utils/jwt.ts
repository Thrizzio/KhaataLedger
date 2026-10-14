import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { z } from 'zod';
import { env } from '../config/env.js';

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  workspaceId?: string;
}

const jwtPayloadSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['OWNER', 'EMPLOYEE']),
  workspaceId: z.string().min(1).optional(),
});

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

export const verifyToken = (token: string): JwtPayload =>
  jwtPayloadSchema.parse(jwt.verify(token, env.JWT_SECRET));
