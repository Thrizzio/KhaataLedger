import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getAuditLogs, getAuditLogById } from '../controllers/audit.controller.js';

export const auditRouter = Router();

// List audit logs for a workspace (newest first)
auditRouter.get('/', authenticate, getAuditLogs);

// Fetch a single audit entry
auditRouter.get('/:id', authenticate, getAuditLogById);
