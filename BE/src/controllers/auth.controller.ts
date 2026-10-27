import { CookieOptions, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { UnauthorizedError } from '../utils/errors.js';

const isProduction = process.env.NODE_ENV === 'production';

export const ACCESS_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  maxAge: 15 * 60 * 1000, // 15 phút
};

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
};

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);

      // Gắn HttpOnly cookies để FE sử dụng credentials: 'include'
      res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      // Trả đúng cấu trúc User mà FE userSchema yêu cầu
      res.status(201).json(result.user);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);

      res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json(result.user);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!rawRefreshToken) {
        throw new UnauthorizedError('Không tìm thấy Refresh Token.');
      }

      const result = await AuthService.refresh(rawRefreshToken);

      res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json(result.user);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      await AuthService.logout(rawRefreshToken);

      res.clearCookie('accessToken', ACCESS_COOKIE_OPTIONS);
      res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const user = await AuthService.getMe(req.user.userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuthService.resetPassword(req.body.token, req.body.newPassword);
      res.status(200).json({ message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' });
    } catch (error) {
      next(error);
    }
  }
}
