import { Router } from 'express';
import { auditRouter } from './audit.routes.js';
import { authRouter } from './auth.routes.js';
import { customersRouter } from './customers.routes.js';
import { transactionsRouter } from './transactions.routes.js';
import { workspacesRouter } from './workspace.routes.js';
import { khataRouter } from './khata.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/customers', customersRouter);
apiRouter.use('/transactions', transactionsRouter);
apiRouter.use('/audit', auditRouter);
apiRouter.use('/workspaces', workspacesRouter);
apiRouter.use('/khata', khataRouter);
