import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';

export const requirePermission = (permission: string): RequestHandler => {
  return async (request, _response, next) => {
    try {
      if (!request.user) {
        throw new ApiError(401, 'Authentication required');
      }

      // Read the current role and permissions so a stale token cannot retain
      // owner privileges after the account is changed or removed.
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { permissions: true, role: true }
      });

      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      // Check the database role, not the role from the JWT.
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
