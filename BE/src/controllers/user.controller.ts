import { Request, Response, NextFunction } from 'express';
import { Role, UserStatus } from '@prisma/client';
import { UserService } from '../services/user.service.js';
import { BadRequestError } from '../utils/errors.js';

function getParamId(raw: string | string[] | undefined): string {
  if (Array.isArray(raw)) return raw[0] ?? '';
  return raw ?? '';
}

export class UserController {
  static async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const search = req.query.search ? String(req.query.search) : undefined;
      const role = req.query.role ? (String(req.query.role) as Role) : undefined;
      const status = req.query.status ? (String(req.query.status) as UserStatus) : undefined;

      const result = await UserService.listUsers({ page, limit, search, role, status });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const user = await UserService.getUserById(id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const status = req.body.status as UserStatus;
      if (!status || !Object.values(UserStatus).includes(status)) {
        throw new BadRequestError('Trạng thái người dùng không hợp lệ.');
      }

      const updated = await UserService.updateUserStatus(id, status);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = getParamId(req.params.id);
      const role = req.body.role as Role;
      if (!role || !Object.values(Role).includes(role)) {
        throw new BadRequestError('Vai trò người dùng không hợp lệ.');
      }

      const updated = await UserService.updateUserRole(id, role);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
}
