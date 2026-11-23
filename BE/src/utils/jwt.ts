import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { TokenPayload } from '../types/auth.types.js';
import { UnauthorizedError } from './errors.js';

function requireSecret(name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET', fallbackDevSecret: string): string {
  const value = process.env[name];
  if (value && value.length >= 32) {
    return value;
  }

  const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || !process.env.NODE_ENV;
  if (isDevOrTest) {
    return fallbackDevSecret;
  }

  throw new Error(`${name} must be configured in environment with at least 32 characters in production.`);
}

const ACCESS_SECRET = requireSecret('JWT_ACCESS_SECRET', 'studyhub_access_secret_super_secure_key_123!');
const REFRESH_SECRET = requireSecret('JWT_REFRESH_SECRET', 'studyhub_refresh_secret_super_secure_key_456!');

const ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as SignOptions['expiresIn'];
const REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];

export function signAccessToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: ACCESS_EXPIRES_IN };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function signRefreshToken(payload: TokenPayload): string {
  // Thêm jwtid duy nhất để mỗi refresh token sinh ra không bị trùng hash ngay cả khi gọi cùng 1 giây
  const options: SignOptions = {
    expiresIn: REFRESH_EXPIRES_IN,
    jwtid: crypto.randomUUID(),
  };
  return jwt.sign(payload, REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch {
    throw new UnauthorizedError('Access token không hợp lệ hoặc đã hết hạn.');
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch {
    throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn.');
  }
}

/** Băm token bằng sha256 trước khi lưu vào DB để bảo vệ nếu DB bị lộ */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
