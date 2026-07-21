import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

export const updateProfile: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const { name, email, avatarUrl } = request.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new ApiError(400, 'Name is required');
    }
    
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new ApiError(400, 'Email is required');
    }

    // Check if email is being changed and if it already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    
    if (existingUser && existingUser.id !== request.user.id) {
      throw new ApiError(409, 'A user with this email already exists');
    }

    const updatedUser = await prisma.user.update({
      where: { id: request.user.id },
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        avatarUrl: avatarUrl ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        employeeId: true,
        workspaceId: true,
        preferences: true,
      }
    });

    response.status(200).json(createSuccessResponse('Profile updated successfully', updatedUser));
  } catch (error) {
    next(error);
  }
};

export const updatePassword: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const { currentPassword, newPassword } = request.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Current and new password are required');
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.id }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid current password');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: request.user.id },
      data: { passwordHash }
    });

    response.status(200).json(createSuccessResponse('Password updated successfully', null));
  } catch (error) {
    next(error);
  }
};

export const updatePreferences: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const { preferences } = request.body;

    const updatedUser = await prisma.user.update({
      where: { id: request.user.id },
      data: {
        preferences: preferences ?? {}
      },
      select: {
        id: true,
        preferences: true,
      }
    });

    response.status(200).json(createSuccessResponse('Preferences updated successfully', updatedUser));
  } catch (error) {
    next(error);
  }
};

export const deleteAccount: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }
    
    const user = await prisma.user.findUnique({
        where: { id: request.user.id }
    });
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    
    if (user.role === 'OWNER') {
        // Find if they have workspaces
        const workspaces = await prisma.workspace.findMany({
            where: { ownerId: user.id }
        });
        
        if (workspaces.length > 0) {
            throw new ApiError(400, 'Cannot delete account because you are the owner of active workspaces. Delete your workspaces first.');
        }
    }

    // Delete user
    await prisma.user.delete({
      where: { id: request.user.id }
    });

    response.status(200).json(createSuccessResponse('Account deleted successfully', null));
  } catch (error) {
    next(error);
  }
};
