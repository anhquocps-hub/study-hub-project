import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { TokenPayload } from '../types/auth.types.js';
import { UnauthorizedError } from './errors.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'studyhub_access_secret_super_secure_key_123!';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'studyhub_refresh_secret_super_secure_key_456!';

const ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as SignOptions['expiresIn'];
const REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];

export function signAccessToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: ACCESS_EXPIRES_IN };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function signRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: REFRESH_EXPIRES_IN };
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
