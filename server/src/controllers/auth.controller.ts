import type { RequestHandler } from 'express';
import { notImplementedResponse } from '../utils/api-response.js';

export const register: RequestHandler = (_request, response) => {
  response.status(200).json(notImplementedResponse());
};

export const login: RequestHandler = (_request, response) => {
  response.status(200).json(notImplementedResponse());
};
