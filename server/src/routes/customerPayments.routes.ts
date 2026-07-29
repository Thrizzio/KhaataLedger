import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { createCustomerPayment, listCustomerPayments } from '../controllers/customerPayment.controller.js';

export const customerPaymentsRouter = Router({ mergeParams: true });

customerPaymentsRouter.get('/', authenticate, listCustomerPayments);

customerPaymentsRouter.post('/', authenticate, authorizeRoles('OWNER'), createCustomerPayment);
