import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';
import { hashPassword } from '../utils/password.js';

// GET /workspaces — returns workspaces owned by the authenticated user
export const getWorkspaces: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const workspaces = await prisma.workspace.findMany({
      where: { ownerId: request.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    const mapped = workspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      ownerId: ws.ownerId,
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt,
      employeeCount: ws._count.users,
    }));

    response.status(200).json(createSuccessResponse('Workspaces fetched successfully', mapped));
  } catch (error) {
    next(error);
  }
};

// POST /workspaces
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

// GET /workspaces/:workspaceId
export const getWorkspaceById: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    const { workspaceId } = request.params;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        _count: { select: { users: true } },
      },
    });

    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    // Owners can access their own workspaces; employees can access their assigned workspace
    if (request.user.role === 'OWNER' && workspace.ownerId !== request.user.id) {
      throw new ApiError(403, 'Access denied');
    }

    if (request.user.role === 'EMPLOYEE') {
      if (request.user.workspaceId !== workspaceId) {
        throw new ApiError(403, 'Access denied');
      }
    }

    response.status(200).json(
      createSuccessResponse('Workspace fetched successfully', {
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.ownerId,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        employeeCount: workspace._count.users,
      }),
    );
  } catch (error) {
    next(error);
  }
};

// GET /workspaces/:workspaceId/employees
export const getWorkspaceEmployees: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    if (request.user.role !== 'OWNER') {
      throw new ApiError(403, 'Only owners can view employees');
    }

    const { workspaceId } = request.params;

    // Verify the workspace belongs to this owner
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace || workspace.ownerId !== request.user.id) {
      throw new ApiError(403, 'Access denied');
    }

    const employees = await prisma.user.findMany({
      where: { workspaceId, role: 'EMPLOYEE' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    response.status(200).json(createSuccessResponse('Employees fetched successfully', employees));
  } catch (error) {
    next(error);
  }
};

// POST /workspaces/:workspaceId/employees
export const createEmployee: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    if (request.user.role !== 'OWNER') {
      throw new ApiError(403, 'Only owners can create employees');
    }

    const { workspaceId } = request.params;

    // Verify the workspace belongs to this owner
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace || workspace.ownerId !== request.user.id) {
      throw new ApiError(403, 'Access denied');
    }

    const { name, email, password } = request.body ?? {};

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new ApiError(400, 'Employee name is required');
    }
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new ApiError(400, 'Employee email is required');
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
      throw new ApiError(400, 'Temporary password is required');
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ApiError(409, 'A user with this email already exists');
    }

    const passwordHash = await hashPassword(password);

    const employee = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'EMPLOYEE',
        workspaceId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        workspaceId: true,
        createdAt: true,
      },
    });

    response.status(201).json(createSuccessResponse('Employee created successfully', employee));
  } catch (error) {
    next(error);
  }
};

// PUT /workspaces/:workspaceId
export const updateWorkspace: RequestHandler = async (request, response, next) => {
  try {
    if (!request.user?.id) {
      throw new ApiError(401, 'Authentication required');
    }

    if (request.user.role !== 'OWNER') {
      throw new ApiError(403, 'Only owners can update workspaces');
    }

    const { workspaceId } = request.params;
    const { name } = request.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new ApiError(400, 'Workspace name is required');
    }

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace || workspace.ownerId !== request.user.id) {
      throw new ApiError(403, 'Access denied');
    }

    const updated = await prisma.workspace.update({
        where: { id: workspaceId },
        data: { name: name.trim() }
    });

    response.status(200).json(createSuccessResponse('Workspace updated successfully', updated));
  } catch (error) {
    next(error);
  }
};

// DELETE /workspaces/:workspaceId
export const deleteWorkspace: RequestHandler = async (request, response, next) => {
    try {
      if (!request.user?.id) {
        throw new ApiError(401, 'Authentication required');
      }
  
      if (request.user.role !== 'OWNER') {
        throw new ApiError(403, 'Only owners can delete workspaces');
      }
  
      const { workspaceId } = request.params;
  
      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
      if (!workspace || workspace.ownerId !== request.user.id) {
        throw new ApiError(403, 'Access denied');
      }
  
      await prisma.workspace.delete({
          where: { id: workspaceId }
      });
  
      response.status(200).json(createSuccessResponse('Workspace deleted successfully', null));
    } catch (error) {
      next(error);
    }
  };
