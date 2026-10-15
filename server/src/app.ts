import cors from 'cors';
import express from 'express';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { createSuccessResponse } from './utils/api-response.js';
import helmet from 'helmet';
import { env } from './config/env.js';

export const app = express();

// Trust reverse proxy (Render load balancer: 1 hop) before rate limiting and route handlers.
// Setting to 1 extracts the real client IP from X-Forwarded-For without blindly trusting
// all upstream spoofed headers.
app.set('trust proxy', env.TRUST_PROXY);

app.use(helmet());
app.disable('x-powered-by');

const normalizedFrontendUrl = env.FRONTEND_URL.replace(/\/+$/, '');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (normalizedOrigin === normalizedFrontendUrl || normalizedOrigin === 'http://localhost:3000') {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (_request, response) => {
  response.status(200).json(createSuccessResponse('Server is healthy'));
});

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
