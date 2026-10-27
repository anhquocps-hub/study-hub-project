import { Router } from 'express';
import { Role } from '@prisma/client';
import { UserController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

export const userRouter = Router();

userRouter.get('/users', authenticate, authorize(Role.ADMIN), UserController.listUsers);
userRouter.get('/users/:id', authenticate, UserController.getUserById);
userRouter.patch('/users/:id/status', authenticate, authorize(Role.ADMIN), UserController.updateStatus);
userRouter.patch('/users/:id/role', authenticate, authorize(Role.ADMIN), UserController.updateRole);
