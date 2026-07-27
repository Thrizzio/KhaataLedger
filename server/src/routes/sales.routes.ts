import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { createSale, listSales } from '../controllers/sale.controller.js';

export const salesRouter = Router({ mergeParams: true });

// Both owners and employees can view sales
salesRouter.get('/', authenticate, listSales);

// Only owners can create sales — this is a financial event
salesRouter.post('/', authenticate, authorizeRoles('OWNER'), createSale);
