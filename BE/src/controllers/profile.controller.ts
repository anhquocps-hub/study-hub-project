import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ProfileService } from '../services/profile.service.js';
import { UnauthorizedError } from '../utils/errors.js';

export class ProfileController {
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawParam = req.params.userId;
      const paramId = Array.isArray(rawParam) ? rawParam[0] : rawParam;
      let targetUserId: string;

      if (!paramId || paramId === 'me') {
        if (!req.user) {
          throw new UnauthorizedError('Vui lòng đăng nhập để xem thông tin cá nhân.');
        }
        targetUserId = req.user.userId;
      } else {
        targetUserId = paramId;
      }

      const currentUserId = req.user?.userId;
      const isAdmin = req.user?.role === Role.ADMIN;

      const profile = await ProfileService.getProfile(targetUserId, currentUserId, isAdmin);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }

  static async updateMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const updated = await ProfileService.updateMyProfile(req.user.userId, req.body);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
}
