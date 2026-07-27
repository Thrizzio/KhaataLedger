import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { createCustomerPayment } from '../controllers/customerPayment.controller.js';

export const customerPaymentsRouter = Router({ mergeParams: true });

customerPaymentsRouter.post('/', authenticate, authorizeRoles('OWNER'), createCustomerPayment);
