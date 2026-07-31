import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permissions.middleware.js';
import { createSupplierPayment, listSupplierPayments } from '../controllers/supplierPayment.controller.js';

export const supplierPaymentsRouter = Router({ mergeParams: true });

supplierPaymentsRouter.get('/', authenticate, requirePermission('PAYMENTS_SUPPLIER_VIEW'), listSupplierPayments);

supplierPaymentsRouter.post('/', authenticate, requirePermission('PAYMENTS_SUPPLIER_RECORD'), createSupplierPayment);
