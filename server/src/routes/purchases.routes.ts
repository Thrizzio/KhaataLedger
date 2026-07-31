import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permissions.middleware.js';
import { createPurchase, listPurchases, getPurchase } from '../controllers/purchase.controller.js';

export const purchasesRouter = Router({ mergeParams: true });

purchasesRouter.get('/', authenticate, requirePermission('PURCHASES_VIEW'), listPurchases);
purchasesRouter.get('/:id', authenticate, requirePermission('PURCHASES_VIEW'), getPurchase);

purchasesRouter.post('/', authenticate, requirePermission('PURCHASES_RECORD'), createPurchase);
