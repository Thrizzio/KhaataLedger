import type { RequestHandler } from 'express';
import { notImplementedResponse } from '../utils/api-response.js';

export const placeholderController: RequestHandler = (_request, response) => {
  response.status(200).json(notImplementedResponse());
};
