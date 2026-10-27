import { NextFunction, Request, Response } from 'express';
import { Role, UserStatus } from '@prisma/client';
import { prisma } from '../db/client.js';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import { verifyAccessToken } from '../utils/jwt.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // 1. Thử lấy từ Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Nếu không có header, thử lấy từ cookie accessToken
    if (!token && req.cookies && typeof req.cookies.accessToken === 'string') {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Vui lòng đăng nhập để tiếp tục.');
    }

    const payload = verifyAccessToken(token);

    // Kiểm tra trạng thái tài khoản trong DB (phòng trường hợp vừa bị khóa/banned)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) {
      throw new UnauthorizedError('Tài khoản không còn tồn tại.');
    }

    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenError('Tài khoản của bạn đã bị khóa do vi phạm tiêu chuẩn.');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/** Tùy chọn xác thực: nếu có token hợp lệ thì gắn req.user, nếu không có thì bỏ qua */
export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && typeof req.cookies.accessToken === 'string') {
      token = req.cookies.accessToken;
    }

    if (token) {
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, status: true },
      });
      if (user && user.status !== UserStatus.BANNED) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
        };
      }
    }
    next();
  } catch {
    // Không làm gián đoạn request nếu token lỗi ở chế độ optional
    next();
  }
}

/** RBAC Middleware: kiểm tra vai trò người dùng */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Yêu cầu xác thực tài khoản.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Bạn không có quyền thực hiện thao tác này.'));
    }

    next();
  };
}
