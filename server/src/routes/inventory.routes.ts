import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import {
    listInventory,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
} from '../controllers/inventory.controller.js';

export const inventoryRouter = Router({ mergeParams: true });

// Both owners and employees can view inventory
inventoryRouter.get('/', authenticate, listInventory);
inventoryRouter.get('/:id', authenticate, getInventoryItem);

// Only owners can mutate inventory
inventoryRouter.post('/', authenticate, authorizeRoles('OWNER'), createInventoryItem);
inventoryRouter.patch('/:id', authenticate, authorizeRoles('OWNER'), updateInventoryItem);
inventoryRouter.delete('/:id', authenticate, authorizeRoles('OWNER'), deleteInventoryItem);
