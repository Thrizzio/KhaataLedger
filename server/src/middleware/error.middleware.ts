import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';
import type { ApiResponse } from '../utils/api-response.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const isProduction = env.NODE_ENV === 'production';

  if (!isProduction) {
    console.error('[ERROR] Unhandled error:', error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }

  if (error instanceof ApiError) {
    const payload: ApiResponse = {
      success: false,
      message: error.message,
      error: isProduction ? undefined : error.details,
    };

    response.status(error.statusCode).json(payload);
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: 'Validation failed',
      error: isProduction ? undefined : error.flatten(),
    } satisfies ApiResponse);
    return;
  }

  response.status(500).json({
    success: false,
    message: 'Internal server error',
    error: isProduction ? undefined : error,
  } satisfies ApiResponse);
};
