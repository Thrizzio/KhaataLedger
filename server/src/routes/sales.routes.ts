import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { createSale } from '../controllers/sale.controller.js';

export const salesRouter = Router({ mergeParams: true });

// Only owners can create sales — this is a financial event
salesRouter.post('/', authenticate, authorizeRoles('OWNER'), createSale);
