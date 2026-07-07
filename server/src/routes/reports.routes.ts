import { Router } from 'express';
import { placeholderController } from '../controllers/placeholder.controller.js';

export const reportsRouter = Router();

reportsRouter.get('/', placeholderController);
