import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { verifyToken } from '../utils/jwt.js';

export const authenticate: RequestHandler = async (request, _response, next) => {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    next(new ApiError(401, 'Authentication token is required'));
    return;
  }

  try {
    const claims = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: claims.id },
      select: { id: true, email: true, role: true, workspaceId: true },
    });

    if (!user) {
      next(new ApiError(401, 'Invalid or expired token'));
      return;
    }

    // Use live account state for authorization. JWT claims identify the
    // session, but must not preserve an old role or workspace assignment.
    request.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId ?? undefined,
    };
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};
