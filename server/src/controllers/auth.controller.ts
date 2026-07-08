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
      throw new ApiError(400, 'User with this email already exists');
    }

    const hashedPassword = await hashPassword(parsedBody.password);

    const user = await prisma.user.create({
      data: {
        name: parsedBody.name,
        email: parsedBody.email.toLowerCase(),
        passwordHash: hashedPassword,
        role: 'OWNER',
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

export const login: RequestHandler = async (request, response, next) => {
  try {
    const parsedBody = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: parsedBody.email.toLowerCase() },
    });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(parsedBody.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

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
