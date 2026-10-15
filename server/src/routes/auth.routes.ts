import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginOwner, loginEmployee, register } from '../controllers/auth.controller.js';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 failed requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Legitimate logins do not burn rate limit quota
  handler: (_req, res) => res.status(429).json({
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
    error: { code: 'RATE_LIMITED' },
  }),
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 failed requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => res.status(429).json({
    success: false,
    message: 'Too many registration attempts, please try again after an hour',
    error: { code: 'RATE_LIMITED' },
  }),
});

authRouter.post('/register', registerLimiter, register);
authRouter.post('/login/owner', loginLimiter, loginOwner);
authRouter.post('/login/employee', loginLimiter, loginEmployee);
