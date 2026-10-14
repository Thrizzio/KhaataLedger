import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';

export const register: RequestHandler = async (request, response, next) => {
  try {
    const parsedBody = registerSchema.parse(request.body);

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
    next(error);
  }
};

async function handleFailedLogin(email: string, userId: string | undefined, ip: string | undefined) {
  await prisma.$transaction(async (tx) => {
    await tx.loginAuditLog.create({
      data: { email, ipAddress: ip },
    });

    if (!userId) return;

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 } },
      select: { failedLoginAttempts: true },
    });

    if (updatedUser.failedLoginAttempts >= 5) {
      await tx.user.update({
        where: { id: userId },
        data: { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) },
      });
    }
  });
}

export const loginOwner: RequestHandler = async (request, response, next) => {
  try {
    const parsedBody = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: parsedBody.email.toLowerCase() },
    });
    if (!user) {
       await handleFailedLogin(parsedBody.email, undefined, request.ip);
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.role !== 'OWNER') {
       await handleFailedLogin(parsedBody.email, user.id, request.ip);
      throw new ApiError(401, 'Invalid email or password'); // Use 401 instead of 403 to not expose email existence
    }

    const isPasswordValid = await verifyPassword(parsedBody.password, user.passwordHash);
    if (!isPasswordValid) {
       await handleFailedLogin(parsedBody.email, user.id, request.ip);
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
       await handleFailedLogin(parsedBody.email, undefined, request.ip);
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.role !== 'EMPLOYEE') {
       await handleFailedLogin(parsedBody.email, user.id, request.ip);
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(parsedBody.password, user.passwordHash);
    if (!isPasswordValid) {
       await handleFailedLogin(parsedBody.email, user.id, request.ip);
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
      workspaceId: user.workspaceId ?? undefined,
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
          permissions: user.permissions,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};
