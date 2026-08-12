import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { env } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';
import type { ApiResponse } from '../utils/api-response.js';

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  const isProduction = env.NODE_ENV === 'production';

  // Safe logging: only access known-safe string properties to avoid
  // crashing Node 24's util.inspect on complex Prisma error objects
  // that contain circular references or broken internal accessors.
  console.error(
    '[ERROR]',
    error?.constructor?.name ?? 'UnknownError',
    '-',
    (error instanceof Error ? error.message : String(error))
  );
  if (error instanceof Error && error.stack && !isProduction) {
    console.error(error.stack);
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
      error: error.flatten(),
    } satisfies ApiResponse);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const target = (error.meta?.target as string[])?.join(', ') || 'field';
      response.status(409).json({
        success: false,
        message: `A record with that ${target} already exists.`,
      } satisfies ApiResponse);
      return;
    }
  }

  response.status(500).json({
    success: false,
    message: 'Internal server error',
  } satisfies ApiResponse);
};