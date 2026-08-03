import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permissions.middleware.js';
import { createCustomerPayment, listCustomerPayments } from '../controllers/customerPayment.controller.js';

export const customerPaymentsRouter = Router({ mergeParams: true });

customerPaymentsRouter.get('/', authenticate, requirePermission('PAYMENTS_CUSTOMER_VIEW'), listCustomerPayments);

customerPaymentsRouter.post('/', authenticate, requirePermission('PAYMENTS_CUSTOMER_RECORD'), createCustomerPayment);
