import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';

export const getWorkspaces: RequestHandler = async (_request, response, next) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
    });

    response.status(200).json(createSuccessResponse('Workspaces fetched successfully', workspaces));
  } catch (error) {
    next(error);
  }
};

export const createWorkspace: RequestHandler = async (request, response, next) => {
  try {
    const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';

    if (!name) {
      throw new ApiError(400, 'Workspace name is required');
    }

    if (!request.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        ownerId: request.user.id,
      },
    });

    response.status(201).json(createSuccessResponse('Workspace created successfully', workspace));
  } catch (error) {
    next(error);
  }
};
