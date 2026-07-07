import { Router } from 'express';
import { placeholderController } from '../controllers/placeholder.controller.js';

export const transactionsRouter = Router();

transactionsRouter.get('/', placeholderController);
transactionsRouter.post('/', placeholderController);
transactionsRouter.get('/:id', placeholderController);
transactionsRouter.patch('/:id', placeholderController);
transactionsRouter.delete('/:id', placeholderController);
