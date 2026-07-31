import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { createSupplierPayment, listSupplierPayments } from '../controllers/supplierPayment.controller.js';

export const supplierPaymentsRouter = Router({ mergeParams: true });

supplierPaymentsRouter.get('/', authenticate, listSupplierPayments);

supplierPaymentsRouter.post('/', authenticate, authorizeRoles('OWNER'), createSupplierPayment);
