import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { createPurchase, listPurchases } from '../controllers/purchase.controller.js';

export const purchasesRouter = Router({ mergeParams: true });

// Both owners and employees can view purchases
purchasesRouter.get('/', authenticate, listPurchases);

// Only owners can create purchases — employees have no write access to financial events
purchasesRouter.post('/', authenticate, authorizeRoles('OWNER'), createPurchase);
