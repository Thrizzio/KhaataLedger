import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';

export const register: RequestHandler = async (request, response, next) => {
  try {
    console.log('[REGISTER] Request received');
    const parsedBody = registerSchema.parse(request.body);
    console.log('[REGISTER] Parsed body:', {
      name: parsedBody.name,
      email: parsedBody.email.toLowerCase(),
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: parsedBody.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    const hashedPassword = await hashPassword(parsedBody.password);

    const user = await prisma.user.create({
      data: {
        name: parsedBody.name,
        email: parsedBody.email.toLowerCase(),
        passwordHash: hashedPassword,
        role: 'OWNER',
        ownedWorkspaces: {
          create: {
            name: `${parsedBody.name}'s Workspace`,
          }
        }
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    response.status(201).json(
      createSuccessResponse('Registration successful', {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    );
  } catch (error) {
    console.error('[REGISTER] Failed:', error);
    next(error);
  }
};

async function handleFailedLogin(email: string, user: any, ip: string | undefined) {
  await prisma.loginAuditLog.create({
    data: { email, ipAddress: ip },
  });

  if (user) {
    const newAttempts = user.failedLoginAttempts + 1;
    if (newAttempts >= 5) {
      const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: newAttempts, lockedUntil },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: newAttempts },
      });
    }
  }
}

export const loginOwner: RequestHandler = async (request, response, next) => {
  try {
    const parsedBody = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: parsedBody.email.toLowerCase() },
    });
    if (!user) {
      await handleFailedLogin(parsedBody.email, null, request.ip);
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.role !== 'OWNER') {
      await handleFailedLogin(parsedBody.email, user, request.ip);
      throw new ApiError(401, 'Invalid email or password'); // Use 401 instead of 403 to not expose email existence
    }

    const isPasswordValid = await verifyPassword(parsedBody.password, user.passwordHash);
    if (!isPasswordValid) {
      await handleFailedLogin(parsedBody.email, user, request.ip);
      throw new ApiError(401, 'Invalid email or password');
    }

    // Reset failed attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    response.status(200).json(
      createSuccessResponse('Login successful', {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

export const loginEmployee: RequestHandler = async (request, response, next) => {
  try {
    const parsedBody = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: parsedBody.email.toLowerCase() },
    });
    if (!user) {
      await handleFailedLogin(parsedBody.email, null, request.ip);
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.role !== 'EMPLOYEE') {
      await handleFailedLogin(parsedBody.email, user, request.ip);
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(parsedBody.password, user.passwordHash);
    if (!isPasswordValid) {
      await handleFailedLogin(parsedBody.email, user, request.ip);
      throw new ApiError(401, 'Invalid email or password');
    }

    // Reset failed attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    response.status(200).json(
      createSuccessResponse('Login successful', {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          workspaceId: user.workspaceId,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};
