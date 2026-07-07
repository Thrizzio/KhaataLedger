import { Router } from 'express';
import { placeholderController } from '../controllers/placeholder.controller.js';

export const auditRouter = Router();

auditRouter.get('/', placeholderController);
