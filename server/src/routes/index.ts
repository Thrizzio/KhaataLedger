import { Router } from 'express';
import { auditRouter } from './audit.routes.js';
import { authRouter } from './auth.routes.js';

import { transactionsRouter } from './transactions.routes.js';
import { workspacesRouter } from './workspace.routes.js';
import { khataRouter } from './khata.routes.js';
import { userRouter } from './user.routes.js';

export const apiRouter = Router();

apiRouter.use('/users', userRouter);

apiRouter.use('/auth', authRouter);

apiRouter.use('/transactions', transactionsRouter);
apiRouter.use('/audit', auditRouter);
apiRouter.use('/workspaces', workspacesRouter);
apiRouter.use('/khata', khataRouter);
