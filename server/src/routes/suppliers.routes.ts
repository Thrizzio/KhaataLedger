import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permissions.middleware.js';
import {
    listSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
} from '../controllers/supplier.controller.js';
import { getSupplierLedger } from '../controllers/ledger.controller.js';
import { getTopPayables } from '../controllers/dashboard.controller.js';

export const suppliersRouter = Router({ mergeParams: true });

// ── Static read routes (must be registered BEFORE /:id to avoid conflicts) ───
suppliersRouter.get('/top-payables', authenticate, requirePermission('DASHBOARD_VIEW'), getTopPayables);

suppliersRouter.get('/', authenticate, requirePermission('SUPPLIERS_VIEW'), listSuppliers);
suppliersRouter.get('/:id', authenticate, requirePermission('SUPPLIERS_VIEW'), getSupplier);
suppliersRouter.get('/:supplierId/ledger', authenticate, requirePermission('SUPPLIERS_VIEW'), getSupplierLedger);

suppliersRouter.post('/', authenticate, requirePermission('SUPPLIERS_CREATE'), createSupplier);
suppliersRouter.patch('/:id', authenticate, requirePermission('SUPPLIERS_EDIT'), updateSupplier);
suppliersRouter.delete('/:id', authenticate, requirePermission('SUPPLIERS_DELETE'), deleteSupplier);

