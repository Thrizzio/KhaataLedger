import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permissions.middleware.js';
import {
    listInventory,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
} from '../controllers/inventory.controller.js';
import { getLowStockItems } from '../controllers/dashboard.controller.js';

export const inventoryRouter = Router({ mergeParams: true });

// ── Static read routes (must be registered BEFORE /:id to avoid conflicts) ───
inventoryRouter.get('/low-stock', authenticate, requirePermission('DASHBOARD_VIEW'), getLowStockItems);

inventoryRouter.get('/', authenticate, requirePermission('INVENTORY_VIEW'), listInventory);
inventoryRouter.get('/:id', authenticate, requirePermission('INVENTORY_VIEW'), getInventoryItem);

inventoryRouter.post('/', authenticate, requirePermission('INVENTORY_CREATE'), createInventoryItem);
inventoryRouter.patch('/:id', authenticate, requirePermission('INVENTORY_EDIT'), updateInventoryItem);
inventoryRouter.delete('/:id', authenticate, requirePermission('INVENTORY_DELETE'), deleteInventoryItem);

