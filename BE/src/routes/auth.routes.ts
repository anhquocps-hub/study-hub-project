import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validations/auth.validation.js';

export const authRouter = Router();

authRouter.post('/auth/register', validateBody(registerSchema), AuthController.register);
authRouter.post('/auth/login', validateBody(loginSchema), AuthController.login);
authRouter.post('/auth/refresh', AuthController.refresh);
authRouter.post('/auth/logout', AuthController.logout);
authRouter.get('/auth/me', authenticate, AuthController.getMe);
authRouter.post('/auth/forgot-password', validateBody(forgotPasswordSchema), AuthController.forgotPassword);
authRouter.post('/auth/reset-password', validateBody(resetPasswordSchema), AuthController.resetPassword);
