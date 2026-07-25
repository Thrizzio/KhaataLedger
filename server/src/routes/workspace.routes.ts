import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    createWorkspace,
    getWorkspaces,
    getWorkspaceById,
    getWorkspaceEmployees,
    createEmployee,
    updateWorkspace,
    deleteWorkspace,
} from '../controllers/workspace.controller.js';
import { reportsRouter } from './reports.routes.js';
import { inventoryRouter } from './inventory.routes.js';
import { customersRouter } from './customers.routes.js';
import { suppliersRouter } from './suppliers.routes.js';
import { purchasesRouter } from './purchases.routes.js';
import { salesRouter } from './sales.routes.js';

export const workspacesRouter = Router();

workspacesRouter.get('/', authenticate, getWorkspaces);
workspacesRouter.post('/', authenticate, createWorkspace);
workspacesRouter.get('/:workspaceId', authenticate, getWorkspaceById);
workspacesRouter.put('/:workspaceId', authenticate, updateWorkspace);
workspacesRouter.delete('/:workspaceId', authenticate, deleteWorkspace);
workspacesRouter.get('/:workspaceId/employees', authenticate, getWorkspaceEmployees);
workspacesRouter.post('/:workspaceId/employees', authenticate, createEmployee);

// Reports are scoped to a workspace: GET /workspaces/:workspaceId/reports
workspacesRouter.use('/:workspaceId/reports', authenticate, reportsRouter);

// Inventory is scoped to a workspace: /workspaces/:workspaceId/inventory
workspacesRouter.use('/:workspaceId/inventory', inventoryRouter);

// Customers are scoped to a workspace: /workspaces/:workspaceId/customers
workspacesRouter.use('/:workspaceId/customers', customersRouter);

// Suppliers are scoped to a workspace: /workspaces/:workspaceId/suppliers
workspacesRouter.use('/:workspaceId/suppliers', suppliersRouter);

// Purchases are scoped to a workspace: /workspaces/:workspaceId/purchases
workspacesRouter.use('/:workspaceId/purchases', purchasesRouter);

// Sales are scoped to a workspace: /workspaces/:workspaceId/sales
workspacesRouter.use('/:workspaceId/sales', salesRouter);
