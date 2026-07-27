import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
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
suppliersRouter.get('/top-payables', authenticate, getTopPayables);

// Both owners and employees can view suppliers
suppliersRouter.get('/', authenticate, listSuppliers);
suppliersRouter.get('/:id', authenticate, getSupplier);
suppliersRouter.get('/:supplierId/ledger', authenticate, getSupplierLedger);

// Only owners can mutate suppliers
suppliersRouter.post('/', authenticate, authorizeRoles('OWNER'), createSupplier);
suppliersRouter.patch('/:id', authenticate, authorizeRoles('OWNER'), updateSupplier);
suppliersRouter.delete('/:id', authenticate, authorizeRoles('OWNER'), deleteSupplier);

