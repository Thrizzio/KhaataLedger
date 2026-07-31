import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permissions.middleware.js';
import { createSale, listSales } from '../controllers/sale.controller.js';

export const salesRouter = Router({ mergeParams: true });

salesRouter.get('/', authenticate, requirePermission('SALES_VIEW'), listSales);
salesRouter.post('/', authenticate, requirePermission('SALES_RECORD'), createSale);
