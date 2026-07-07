import { Router } from 'express';
import { placeholderController } from '../controllers/placeholder.controller.js';

export const customersRouter = Router();

customersRouter.get('/', placeholderController);
customersRouter.post('/', placeholderController);
customersRouter.get('/:id', placeholderController);
customersRouter.patch('/:id', placeholderController);
customersRouter.delete('/:id', placeholderController);
