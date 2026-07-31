import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';

export const requirePermission = (permission: string): RequestHandler => {
  return async (request, _response, next) => {
    try {
      if (!request.user) {
        throw new ApiError(401, 'Authentication required');
      }

      // Owners bypass all permission checks
      if (request.user.role === 'OWNER') {
        return next();
      }

      // If they are an employee, we must verify their permissions
      // We fetch from the database to ensure immediate effect
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { permissions: true, role: true }
      });

      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      // Double-check role in case it somehow changed
      if (user.role === 'OWNER') {
        return next();
      }

      if (!user.permissions || !user.permissions.includes(permission)) {
        throw new ApiError(403, `Access denied. Requires permission: ${permission}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
