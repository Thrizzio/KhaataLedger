import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { createWorkspace, getWorkspaces } from '../controllers/workspace.controller.js';

export const workspacesRouter = Router();

workspacesRouter.get('/', authenticate, getWorkspaces);
workspacesRouter.post('/', authenticate, createWorkspace);
