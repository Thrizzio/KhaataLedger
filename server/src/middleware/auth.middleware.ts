import type { RequestHandler } from 'express';
import { ApiError } from '../utils/api-error.js';
import { verifyToken } from '../utils/jwt.js';

export const authenticate: RequestHandler = (request, _response, next) => {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    next(new ApiError(401, 'Authentication token is required'));
    return;
  }

  try {
    request.user = verifyToken(token);
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token', error));
  }
};
