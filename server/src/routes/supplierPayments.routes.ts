import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { createSupplierPayment } from '../controllers/supplierPayment.controller.js';

export const supplierPaymentsRouter = Router({ mergeParams: true });

supplierPaymentsRouter.post('/', authenticate, authorizeRoles('OWNER'), createSupplierPayment);
