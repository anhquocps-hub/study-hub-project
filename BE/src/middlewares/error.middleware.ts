import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      message: err.message,
      fieldErrors: err.fieldErrors,
    });
    return;
  }

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const fieldPath = issue.path.join('.');
      if (fieldPath && !fieldErrors[fieldPath]) {
        fieldErrors[fieldPath] = issue.message;
      }
    }

    res.status(400).json({
      message: 'Dữ liệu gửi lên không hợp lệ.',
      fieldErrors,
    });
    return;
  }

  // Xử lý các lỗi từ Prisma Client
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint failed (trùng khóa chính hoặc trường unique)
    if (err.code === 'P2002') {
      const target = err.meta?.target;
      const targetFields = Array.isArray(target) ? target.map(String) : [String(target ?? '')];
      const isEmail = targetFields.some((f) => f.includes('email'));

      res.status(409).json({
        message: isEmail ? 'Email này đã được sử dụng.' : 'Dữ liệu đã tồn tại trong hệ thống.',
        fieldErrors: isEmail ? { email: 'Email này đã được sử dụng.' } : {},
      });
      return;
    }

    // P2003: Foreign key constraint failed
    if (err.code === 'P2003') {
      res.status(400).json({
        message: 'Dữ liệu liên kết không hợp lệ (mã trường hoặc mã ngành không tồn tại).',
        fieldErrors: {},
      });
      return;
    }

    // P2025: Record to update/delete not found
    if (err.code === 'P2025') {
      res.status(404).json({
        message: 'Không tìm thấy bản ghi yêu cầu.',
        fieldErrors: {},
      });
      return;
    }
  }

  console.error('Unhandled server error:', err);
  res.status(500).json({
    message: 'Đã có lỗi xảy ra từ máy chủ. Vui lòng thử lại sau.',
    fieldErrors: {},
  });
}
