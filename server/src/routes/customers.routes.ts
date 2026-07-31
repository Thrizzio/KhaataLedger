import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permissions.middleware.js';
import {
    listCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} from '../controllers/customer.controller.js';
import { getCustomerLedger } from '../controllers/ledger.controller.js';
import { getTopDebtors } from '../controllers/dashboard.controller.js';

export const customersRouter = Router({ mergeParams: true });

// ── Static read routes (must be registered BEFORE /:id to avoid conflicts) ───
customersRouter.get('/top-debtors', authenticate, requirePermission('DASHBOARD_VIEW'), getTopDebtors);

customersRouter.get('/', authenticate, requirePermission('CUSTOMERS_VIEW'), listCustomers);
customersRouter.get('/:id', authenticate, requirePermission('CUSTOMERS_VIEW'), getCustomer);
customersRouter.get('/:customerId/ledger', authenticate, requirePermission('CUSTOMERS_VIEW'), getCustomerLedger);

customersRouter.post('/', authenticate, requirePermission('CUSTOMERS_CREATE'), createCustomer);
customersRouter.patch('/:id', authenticate, requirePermission('CUSTOMERS_EDIT'), updateCustomer);
customersRouter.delete('/:id', authenticate, requirePermission('CUSTOMERS_DELETE'), deleteCustomer);

