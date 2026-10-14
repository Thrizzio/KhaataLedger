import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { errorHandler } from '../src/middleware/error.middleware.js';
import { registerSchema } from '../src/validators/auth.validator.js';
import { verifyToken } from '../src/utils/jwt.js';

type ResponseRecorder = {
  statusCode: number;
  body: unknown;
  status: (code: number) => ResponseRecorder;
  json: (body: unknown) => ResponseRecorder;
};

const createResponse = (): ResponseRecorder => {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      response.statusCode = code;
      return response;
    },
    json(body: unknown) {
      response.body = body;
      return response;
    },
  };
  return response;
};

const handle = (error: unknown): ResponseRecorder => {
  const response = createResponse();
  const originalError = console.error;
  console.error = () => undefined;
  try {
    errorHandler(error, {} as never, response as never, (() => undefined) as never);
  } finally {
    console.error = originalError;
  }
  return response;
};

test('malformed JSON receives a structured 400 response', () => {
  const malformedJson = Object.assign(new SyntaxError('parser detail'), {
    type: 'entity.parse.failed',
  });

  const response = handle(malformedJson);

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Malformed JSON request body',
    error: { code: 'MALFORMED_JSON' },
  });
});

test('Zod failures expose fieldErrors without raw exception details', () => {
  let validationError: ZodError;
  try {
    registerSchema.parse({ name: '', email: 'invalid', password: 'short' });
    throw new Error('expected validation to fail');
  } catch (error) {
    assert.ok(error instanceof ZodError);
    validationError = error;
  }

  const response = handle(validationError!);
   const body = response.body as { error: { code: string; fieldErrors: Record<string, string[]> } };

   assert.equal(response.statusCode, 400);
   assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(body.error.fieldErrors.name?.length);
  assert.ok(body.error.fieldErrors.email?.length);
  assert.ok(body.error.fieldErrors.password?.length);
  assert.equal('issues' in body.error, false);
});

test('registration keeps the eight-character password boundary', () => {
  assert.throws(() => registerSchema.parse({
    name: 'Asha Traders',
    email: 'asha@example.com',
    password: 'short7',
  }), ZodError);

  const parsed = registerSchema.parse({
    name: 'Asha Traders',
    email: 'ASHA@example.com',
    password: 'secure8!',
  });
  assert.equal(parsed.email, 'asha@example.com');
  assert.equal(parsed.password, 'secure8!');
});

test('Prisma uniqueness and transaction conflicts do not expose database fields', () => {
  const duplicate = new Prisma.PrismaClientKnownRequestError('database details', {
    code: 'P2002',
    clientVersion: '5.22.0',
    meta: { target: ['email'] },
  });
  const conflict = new Prisma.PrismaClientKnownRequestError('transaction details', {
    code: 'P2034',
    clientVersion: '5.22.0',
  });

  const duplicateResponse = handle(duplicate);
  const conflictResponse = handle(conflict);

  assert.equal(duplicateResponse.statusCode, 409);
  assert.deepEqual(duplicateResponse.body, {
    success: false,
    message: 'A record with those values already exists.',
    error: { code: 'DUPLICATE_RECORD' },
  });
  assert.equal(conflictResponse.statusCode, 409);
  assert.deepEqual(conflictResponse.body, {
    success: false,
    message: 'The operation conflicted with another update; please retry.',
    error: { code: 'TRANSACTION_CONFLICT' },
  });
});

test('JWT verification rejects signed tokens with malformed claims', () => {
  const token = jwt.sign(
    { id: 'user-id', email: 'not-an-email', role: 'OWNER' },
    'test-only-secret',
  );

  assert.throws(() => verifyToken(token));
});
