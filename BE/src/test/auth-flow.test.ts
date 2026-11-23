import assert from 'node:assert';
import { Role } from '@prisma/client';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { hashToken, signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError, BadRequestError, ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import { loginSchema, registerSchema } from '../validations/auth.validation.js';

async function runTests() {
  console.log('--- Bắt đầu kiểm thử Auth Logic & Validation ---');

  // 1. Password Hashing
  const rawPass = 'DemoPass123';
  const hashed = await hashPassword(rawPass);
  assert.notStrictEqual(rawPass, hashed);
  assert.strictEqual(await comparePassword(rawPass, hashed), true);
  assert.strictEqual(await comparePassword('WrongPass', hashed), false);
  console.log('✓ Hash và so khớp mật khẩu chính xác');

  // 2. JWT Access Token
  const payload = { userId: 'user-123', email: 'test@studyhub.vn', role: Role.USER };
  const accessToken = signAccessToken(payload);
  const decodedAccess = verifyAccessToken(accessToken);
  assert.strictEqual(decodedAccess.userId, payload.userId);
  assert.strictEqual(decodedAccess.email, payload.email);
  assert.strictEqual(decodedAccess.role, Role.USER);
  console.log('✓ Ký và giải mã Access Token chính xác');

  // 3. JWT Refresh Token & Token Hashing
  const refreshToken = signRefreshToken(payload);
  const decodedRefresh = verifyRefreshToken(refreshToken);
  assert.strictEqual(decodedRefresh.userId, payload.userId);

  const hashedToken1 = hashToken(refreshToken);
  const hashedToken2 = hashToken(refreshToken);
  assert.strictEqual(hashedToken1, hashedToken2);
  console.log('✓ Ký, giải mã Refresh Token và SHA-256 Token Hash chính xác');

  // 4. Error Hierarchy & Formats
  const badReq = new BadRequestError('Lỗi dữ liệu', { email: 'Email không hợp lệ' });
  assert.strictEqual(badReq.status, 400);
  assert.strictEqual(badReq.fieldErrors.email, 'Email không hợp lệ');

  const unauth = new UnauthorizedError();
  assert.strictEqual(unauth.status, 401);

  const forbidden = new ForbiddenError();
  assert.strictEqual(forbidden.status, 403);
  console.log('✓ Cấu trúc lỗi AppError và HTTP status phản hồi chuẩn xác');

  // 5. Validation Schemas
  const validRegister = {
    fullName: 'Nguyen Van A',
    email: 'test@studyhub.vn',
    password: 'password123',
    universityId: 'hcmute',
    acceptTerms: true,
  };
  const parsedRegister = registerSchema.safeParse(validRegister);
  assert.strictEqual(parsedRegister.success, true);

  const invalidRegister = {
    fullName: 'A', // Quá ngắn
    email: 'not-an-email',
    password: '123', // Quá ngắn
    universityId: '',
    acceptTerms: false,
  };
  const failedRegister = registerSchema.safeParse(invalidRegister);
  assert.strictEqual(failedRegister.success, false);
  console.log('✓ Zod Validation cho form Đăng ký hoạt động chính xác');

  const validLogin = { email: 'user@test.com', password: 'password123' };
  assert.strictEqual(loginSchema.safeParse(validLogin).success, true);
  console.log('✓ Zod Validation cho form Đăng nhập hoạt động chính xác');

  console.log('--- TOÀN BỘ KIỂM THỬ THÀNH CÔNG ---');
}

runTests().catch((err) => {
  console.error('Test thất bại:', err);
  process.exit(1);
});
