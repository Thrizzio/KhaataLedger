import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permissions.middleware.js';
import {
    createWorkspace,
    getWorkspaces,
    getWorkspaceById,
    getWorkspaceEmployees,
    createEmployee,
    updateWorkspace,
    deleteWorkspace,
    getEmployeeById,
    updateEmployeePermissions
} from '../controllers/workspace.controller.js';
import { reportsRouter } from './reports.routes.js';
import { inventoryRouter } from './inventory.routes.js';
import { customersRouter } from './customers.routes.js';
import { suppliersRouter } from './suppliers.routes.js';
import { purchasesRouter } from './purchases.routes.js';
import { salesRouter } from './sales.routes.js';
import { customerPaymentsRouter } from './customerPayments.routes.js';
import { supplierPaymentsRouter } from './supplierPayments.routes.js';
import { getDashboard, getRecentActivity } from '../controllers/dashboard.controller.js';

export const workspacesRouter = Router();

workspacesRouter.get('/', authenticate, getWorkspaces);
workspacesRouter.post('/', authenticate, createWorkspace);
workspacesRouter.get('/:workspaceId', authenticate, getWorkspaceById);
workspacesRouter.put('/:workspaceId', authenticate, updateWorkspace);
workspacesRouter.delete('/:workspaceId', authenticate, deleteWorkspace);
workspacesRouter.get('/:workspaceId/employees', authenticate, requirePermission('EMPLOYEES_VIEW'), getWorkspaceEmployees);
workspacesRouter.post('/:workspaceId/employees', authenticate, createEmployee);
workspacesRouter.get('/:workspaceId/employees/:employeeId', authenticate, getEmployeeById);
workspacesRouter.put('/:workspaceId/employees/:employeeId/permissions', authenticate, updateEmployeePermissions);

// Reports are scoped to a workspace: GET /workspaces/:workspaceId/reports
workspacesRouter.use('/:workspaceId/reports', authenticate, requirePermission('DASHBOARD_VIEW'), reportsRouter);

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

// Customer payments: /workspaces/:workspaceId/customer-payments
workspacesRouter.use('/:workspaceId/customer-payments', customerPaymentsRouter);

// Supplier payments: /workspaces/:workspaceId/supplier-payments
workspacesRouter.use('/:workspaceId/supplier-payments', supplierPaymentsRouter);

// Dashboard: GET /workspaces/:workspaceId/dashboard
workspacesRouter.get('/:workspaceId/dashboard', authenticate, requirePermission('DASHBOARD_VIEW'), getDashboard);

// Recent activity: GET /workspaces/:workspaceId/activity
workspacesRouter.get('/:workspaceId/activity', authenticate, requirePermission('DASHBOARD_VIEW'), getRecentActivity);
