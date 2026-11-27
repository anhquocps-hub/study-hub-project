import assert from 'node:assert';
import { ResetTokenType, Role, UserStatus } from '@prisma/client';
import { prisma } from '../db/client.js';
import { AuthService } from '../services/auth.service.js';
import { UserService } from '../services/user.service.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { hashToken, signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import { setResetOtpSenderForTest } from '../utils/mailer.js';
import {
  BadRequestError,
  ForbiddenError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../utils/errors.js';
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyResetOtpSchema,
} from '../validations/auth.validation.js';

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

  assert.strictEqual(verifyResetOtpSchema.safeParse({ email: 'user@test.com', otp: '123456' }).success, true);
  assert.strictEqual(verifyResetOtpSchema.safeParse({ email: 'user@test.com', otp: '12ab56' }).success, false);
  assert.strictEqual(verifyResetOtpSchema.safeParse({ email: 'user@test.com', otp: '12345' }).success, false);
  assert.strictEqual(
    resetPasswordSchema.safeParse({ token: 'a'.repeat(64), newPassword: 'NewStrongPassword123' }).success,
    true
  );
  assert.strictEqual(
    resetPasswordSchema.safeParse({ token: 'user-1:123456', newPassword: 'NewStrongPassword123' }).success,
    false
  );
  console.log('✓ Zod Validation cho form Xác thực OTP và Đặt lại mật khẩu hoạt động chính xác');

  // 6. Luồng 3 bước Forgot Password -> Verify OTP -> Reset Password (in-memory Prisma stub)
  interface MockResetRecord {
    id: string;
    tokenHash: string;
    userId: string;
    type: ResetTokenType;
    attempts: number;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
  }

  const mockUser = {
    id: 'user-otp-1',
    email: 'otp@studyhub.vn',
    passwordHash: await hashPassword('OldPass123'),
    role: Role.USER,
    status: UserStatus.ACTIVE,
  };
  const resetTokens: MockResetRecord[] = [];
  let revokedRefreshCount = 0;

  const prismaAny = prisma as unknown as Record<string, unknown>;
  const origUser = prismaAny.user;
  const origResetToken = prismaAny.passwordResetToken;
  const origRefreshToken = prismaAny.refreshToken;
  const origTransaction = prismaAny.$transaction;

  let capturedOtp = '';
  setResetOtpSenderForTest(async (_to, otp) => {
    capturedOtp = otp;
  });

  try {
    prismaAny.user = {
      findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
        if (where.email === mockUser.email || where.id === mockUser.id) return { ...mockUser };
        return null;
      },
      update: async ({ where, data }: { where: { id: string }; data: { passwordHash?: string } }) => {
        if (where.id === mockUser.id && data.passwordHash) {
          mockUser.passwordHash = data.passwordHash;
        }
        return { ...mockUser };
      },
    };

    prismaAny.passwordResetToken = {
      findFirst: async ({
        where,
      }: {
        where: {
          userId?: string;
          type?: ResetTokenType;
          usedAt?: null;
          expiresAt?: { gt: Date };
          createdAt?: { gt: Date };
        };
      }) => {
        const filtered = resetTokens
          .filter((r) => {
            if (where.userId && r.userId !== where.userId) return false;
            if (where.type && r.type !== where.type) return false;
            if (where.usedAt === null && r.usedAt !== null) return false;
            if (where.expiresAt?.gt && !(r.expiresAt > where.expiresAt.gt)) return false;
            if (where.createdAt?.gt && !(r.createdAt > where.createdAt.gt)) return false;
            return true;
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return filtered[0] ? { ...filtered[0] } : null;
      },
      findUnique: async ({ where }: { where: { tokenHash?: string } }) => {
        const found = resetTokens.find((r) => r.tokenHash === where.tokenHash);
        return found ? { ...found } : null;
      },
      create: async ({
        data,
      }: {
        data: { tokenHash: string; userId: string; type?: ResetTokenType; expiresAt: Date };
      }) => {
        const rec: MockResetRecord = {
          id: `prt-${resetTokens.length + 1}`,
          tokenHash: data.tokenHash,
          userId: data.userId,
          type: data.type ?? ResetTokenType.OTP,
          attempts: 0,
          expiresAt: data.expiresAt,
          usedAt: null,
          createdAt: new Date(),
        };
        resetTokens.push(rec);
        return { ...rec };
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: { attempts?: number | { increment: number }; usedAt?: Date };
      }) => {
        const rec = resetTokens.find((r) => r.id === where.id);
        if (!rec) throw new Error('Record not found');
        if (typeof data.attempts === 'number') {
          rec.attempts = data.attempts;
        } else if (data.attempts && typeof data.attempts === 'object' && 'increment' in data.attempts) {
          rec.attempts += data.attempts.increment;
        }
        if (data.usedAt !== undefined) rec.usedAt = data.usedAt;
        return { ...rec };
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: {
          id?: string;
          userId?: string;
          type?: ResetTokenType;
          usedAt?: null;
          expiresAt?: { gt: Date };
        };
        data: { usedAt: Date };
      }) => {
        let count = 0;
        for (const rec of resetTokens) {
          if (where.id && rec.id !== where.id) continue;
          if (where.userId && rec.userId !== where.userId) continue;
          if (where.type && rec.type !== where.type) continue;
          if (where.usedAt === null && rec.usedAt !== null) continue;
          if (where.expiresAt?.gt && !(rec.expiresAt > where.expiresAt.gt)) continue;
          rec.usedAt = data.usedAt;
          count++;
        }
        return { count };
      },
    };

    prismaAny.refreshToken = {
      updateMany: async () => {
        revokedRefreshCount++;
        return { count: 1 };
      },
    };

    prismaAny.$transaction = async (opsOrFn: unknown) => {
      if (typeof opsOrFn === 'function') {
        return (opsOrFn as (tx: typeof prisma) => Promise<unknown>)(prisma);
      }
      return Promise.all(opsOrFn as Array<Promise<unknown>>);
    };

    // 6a. Gửi OTP & chặn spam dưới 60s
    await AuthService.forgotPassword(mockUser.email);
    assert.match(capturedOtp, /^\d{6}$/);

    await assert.rejects(
      () => AuthService.forgotPassword(mockUser.email),
      (err: unknown) => err instanceof TooManyRequestsError && err.status === 429
    );
    console.log('✓ forgot-password gửi OTP 6 số và chặn spam dưới 60s');

    // 6b. Nhập sai OTP 5 lần -> vô hiệu hóa mã
    const wrongOtp = capturedOtp === '000000' ? '111111' : '000000';
    for (let i = 1; i <= 5; i++) {
      await assert.rejects(
        () => AuthService.verifyResetOtp(mockUser.email, wrongOtp),
        (err: unknown) => err instanceof BadRequestError
      );
    }
    assert.strictEqual(resetTokens[0].attempts, 5);
    assert.notStrictEqual(resetTokens[0].usedAt, null);

    // Thử lại với OTP đúng sau khi đã bị vô hiệu hóa -> vẫn phải từ chối
    await assert.rejects(
      () => AuthService.verifyResetOtp(mockUser.email, capturedOtp),
      (err: unknown) => err instanceof BadRequestError
    );
    console.log('✓ verify-reset-otp sai quá 5 lần bị vô hiệu hóa');

    // 6c. Tạo OTP mới -> verify đúng -> kiểm tra cô lập giữa OTP và RESET grant -> resetPassword
    for (const rec of resetTokens) {
      rec.createdAt = new Date(Date.now() - 120_000);
    }
    capturedOtp = '';
    await AuthService.forgotPassword(mockUser.email);
    assert.match(capturedOtp, /^\d{6}$/);

    // Không thể dùng trực tiếp chuỗi OTP ở resetPassword
    await assert.rejects(
      () => AuthService.resetPassword(`${mockUser.id}:${capturedOtp}`, 'NewStrongPass123'),
      (err: unknown) => err instanceof BadRequestError
    );

    const { resetToken } = await AuthService.verifyResetOtp(mockUser.email, capturedOtp);
    assert.ok(resetToken && /^[a-f0-9]{64}$/.test(resetToken));

    // Thử verifyResetOtp thêm lần nữa (sai/trùng) không làm hỏng resetToken đã cấp
    await assert.rejects(
      () => AuthService.verifyResetOtp(mockUser.email, capturedOtp),
      (err: unknown) => err instanceof BadRequestError
    );

    await AuthService.resetPassword(resetToken, 'NewStrongPass123');
    assert.strictEqual(await comparePassword('NewStrongPass123', mockUser.passwordHash), true);
    assert.strictEqual(revokedRefreshCount, 1);
    console.log('✓ verify-reset-otp đúng trả resetToken và reset-password đổi mật khẩu thành công');

    // 7. Chặn Admin tự khóa / tự gỡ quyền chính mình
    await assert.rejects(
      () => UserService.updateUserStatus('admin-1', UserStatus.BANNED, 'admin-1'),
      (err: unknown) => err instanceof BadRequestError
    );
    await assert.rejects(
      () => UserService.updateUserRole('admin-1', Role.USER, 'admin-1'),
      (err: unknown) => err instanceof BadRequestError
    );
    console.log('✓ Chặn Admin tự khóa hoặc tự gỡ quyền chính mình thành công');
  } finally {
    setResetOtpSenderForTest(null);
    prismaAny.user = origUser;
    prismaAny.passwordResetToken = origResetToken;
    prismaAny.refreshToken = origRefreshToken;
    prismaAny.$transaction = origTransaction;
  }

  console.log('--- TOÀN BỘ KIỂM THỬ THÀNH CÔNG ---');
}

runTests().catch((err) => {
  console.error('Test thất bại:', err);
  process.exit(1);
});
