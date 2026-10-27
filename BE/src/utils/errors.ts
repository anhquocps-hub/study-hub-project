export class AppError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(400, message, fieldErrors);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Bạn không có quyền thực hiện hành động này.') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy tài nguyên yêu cầu.') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(409, message, fieldErrors);
    this.name = 'ConflictError';
  }
}
