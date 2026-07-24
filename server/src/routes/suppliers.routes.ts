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

export const suppliersRouter = Router({ mergeParams: true });

// Both owners and employees can view suppliers
suppliersRouter.get('/', authenticate, listSuppliers);
suppliersRouter.get('/:id', authenticate, getSupplier);

// Only owners can mutate suppliers
suppliersRouter.post('/', authenticate, authorizeRoles('OWNER'), createSupplier);
suppliersRouter.patch('/:id', authenticate, authorizeRoles('OWNER'), updateSupplier);
suppliersRouter.delete('/:id', authenticate, authorizeRoles('OWNER'), deleteSupplier);
