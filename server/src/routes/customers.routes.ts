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

export const customersRouter = Router({ mergeParams: true });

// Both owners and employees can view customers
customersRouter.get('/', authenticate, listCustomers);
customersRouter.get('/:id', authenticate, getCustomer);

// Only owners can mutate customers
customersRouter.post('/', authenticate, authorizeRoles('OWNER'), createCustomer);
customersRouter.patch('/:id', authenticate, authorizeRoles('OWNER'), updateCustomer);
customersRouter.delete('/:id', authenticate, authorizeRoles('OWNER'), deleteCustomer);
