import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/api-error.js';
import type { ApiResponse } from '../utils/api-response.js';

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  // Do not log request bodies, tokens, database errors, or arbitrary error
  // objects. Prisma errors can contain sensitive query/context data.
  console.error('[ERROR]', error?.constructor?.name ?? 'UnknownError');

  if (error && typeof error === 'object' && 'type' in error && error.type === 'entity.parse.failed') {
    response.status(400).json({
      success: false,
      message: 'Malformed JSON request body',
      error: { code: 'MALFORMED_JSON' },
    } satisfies ApiResponse);
    return;
  }

  if (error instanceof ApiError) {
    const details = isFieldErrorDetails(error.details) ? error.details : undefined;
    const payload: ApiResponse = {
      success: false,
      message: error.message,
      error: {
        code: codeForStatus(error.statusCode),
        ...(details ? {
          fieldErrors: details.fieldErrors,
          formErrors: details.formErrors,
        } : {}),
      },
    };
    response.status(error.statusCode).json(payload);
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: 'Please correct the highlighted fields.',
      error: {
        code: 'VALIDATION_ERROR',
        fieldErrors: error.flatten().fieldErrors,
        formErrors: error.flatten().formErrors,
      },
    } satisfies ApiResponse);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      response.status(409).json({
        success: false,
        message: 'A record with those values already exists.',
        error: { code: 'DUPLICATE_RECORD' },
      } satisfies ApiResponse);
      return;
    }

    if (error.code === 'P2025') {
      response.status(409).json({
        success: false,
        message: 'The record was changed or removed; please retry.',
        error: { code: 'RESOURCE_CONFLICT' },
      } satisfies ApiResponse);
      return;
    }

    if (error.code === 'P2034') {
      response.status(409).json({
        success: false,
        message: 'The operation conflicted with another update; please retry.',
        error: { code: 'TRANSACTION_CONFLICT' },
      } satisfies ApiResponse);
      return;
    }
  }

  response.status(500).json({
    success: false,
    message: 'Internal server error',
    error: { code: 'INTERNAL_SERVER_ERROR' },
  } satisfies ApiResponse);
};

function codeForStatus(statusCode: number): string {
  if (statusCode === 400) return 'BAD_REQUEST';
  if (statusCode === 401) return 'UNAUTHENTICATED';
  if (statusCode === 403) return 'FORBIDDEN';
  if (statusCode === 404) return 'NOT_FOUND';
  if (statusCode === 409) return 'CONFLICT';
  if (statusCode === 422) return 'VALIDATION_ERROR';
  return statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED';
}

function isFieldErrorDetails(value: unknown): value is {
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
} {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { fieldErrors?: unknown; formErrors?: unknown };
  return Boolean(
    (candidate.fieldErrors && typeof candidate.fieldErrors === 'object') ||
    (Array.isArray(candidate.formErrors) && candidate.formErrors.every((item) => typeof item === 'string')),
  );
}
