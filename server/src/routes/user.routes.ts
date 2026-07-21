import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    updateProfile,
    updatePassword,
    updatePreferences,
    deleteAccount
} from '../controllers/user.controller.js';

export const userRouter = Router();

userRouter.put('/profile', authenticate, updateProfile);
userRouter.put('/password', authenticate, updatePassword);
userRouter.put('/preferences', authenticate, updatePreferences);
userRouter.delete('/me', authenticate, deleteAccount);
