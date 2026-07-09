import cors from 'cors';
import express from 'express';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { createSuccessResponse } from './utils/api-response.js';

export const app = express();

app.use((request, response, next) => {
  const startedAt = Date.now();

  response.on('finish', () => {
    console.log(`[REQUEST] ${request.method} ${request.originalUrl} -> ${response.statusCode} (${Date.now() - startedAt}ms)`);
  });

  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_request, response) => {
  response.status(200).json(createSuccessResponse('Server is healthy'));
});

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
