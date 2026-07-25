import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
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
customersRouter.get('/top-debtors', authenticate, getTopDebtors);

// Both owners and employees can view customers
customersRouter.get('/', authenticate, listCustomers);
customersRouter.get('/:id', authenticate, getCustomer);
customersRouter.get('/:customerId/ledger', authenticate, getCustomerLedger);

// Only owners can mutate customers
customersRouter.post('/', authenticate, authorizeRoles('OWNER'), createCustomer);
customersRouter.patch('/:id', authenticate, authorizeRoles('OWNER'), updateCustomer);
customersRouter.delete('/:id', authenticate, authorizeRoles('OWNER'), deleteCustomer);

