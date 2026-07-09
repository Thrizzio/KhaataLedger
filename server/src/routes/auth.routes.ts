import { Router } from 'express';
import { loginOwner, loginEmployee, register } from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login/owner', loginOwner);
authRouter.post('/login/employee', loginEmployee);
authRouter.get('/', register);
