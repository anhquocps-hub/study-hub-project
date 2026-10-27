import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { updateProfileSchema } from '../validations/profile.validation.js';

export const profileRouter = Router();

profileRouter.get('/profiles/me', authenticate, ProfileController.getProfile);
profileRouter.patch('/profiles/me', authenticate, validateBody(updateProfileSchema), ProfileController.updateMyProfile);
profileRouter.get('/profiles/:userId', optionalAuthenticate, ProfileController.getProfile);
