import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    createWorkspace,
    getWorkspaces,
    getWorkspaceById,
    getWorkspaceEmployees,
    createEmployee,
} from '../controllers/workspace.controller.js';
import { reportsRouter } from './reports.routes.js';

export const workspacesRouter = Router();

workspacesRouter.get('/', authenticate, getWorkspaces);
workspacesRouter.post('/', authenticate, createWorkspace);
workspacesRouter.get('/:workspaceId', authenticate, getWorkspaceById);
workspacesRouter.get('/:workspaceId/employees', authenticate, getWorkspaceEmployees);
workspacesRouter.post('/:workspaceId/employees', authenticate, createEmployee);

// Reports are scoped to a workspace: GET /workspaces/:workspaceId/reports
workspacesRouter.use('/:workspaceId/reports', authenticate, reportsRouter);
