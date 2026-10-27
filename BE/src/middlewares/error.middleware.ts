import { NextFunction, Request, Response } from 'express';
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

  console.error('Unhandled server error:', err);
  res.status(500).json({
    message: 'Đã có lỗi xảy ra từ máy chủ. Vui lòng thử lại sau.',
    fieldErrors: {},
  });
}
