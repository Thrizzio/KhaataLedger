import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginOwner, loginEmployee, register } from '../controllers/auth.controller.js';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  handler: (_req, res) => res.status(429).json({ success: false, error: 'Too many login attempts, please try again after 15 minutes' }),
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  handler: (_req, res) => res.status(429).json({ success: false, error: 'Too many registration attempts, please try again after an hour' }),
});

authRouter.post('/register', registerLimiter, register);
authRouter.post('/login/owner', loginLimiter, loginOwner);
authRouter.post('/login/employee', loginLimiter, loginEmployee);
