import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    createWorkspace,
    getWorkspaces,
    getWorkspaceById,
    getWorkspaceEmployees,
    createEmployee,
} from '../controllers/workspace.controller.js';

export const workspacesRouter = Router();

workspacesRouter.get('/', authenticate, getWorkspaces);
workspacesRouter.post('/', authenticate, createWorkspace);
workspacesRouter.get('/:workspaceId', authenticate, getWorkspaceById);
workspacesRouter.get('/:workspaceId/employees', authenticate, getWorkspaceEmployees);
workspacesRouter.post('/:workspaceId/employees', authenticate, createEmployee);
