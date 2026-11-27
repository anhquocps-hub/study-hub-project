import crypto from 'node:crypto';
import { ResetTokenType, Role, UserStatus } from '@prisma/client';
import { prisma } from '../db/client.js';
import { TokenPayload, UserSummary } from '../types/auth.types.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../utils/errors.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendResetOtpEmail } from '../utils/mailer.js';

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  universityId: string;
  studentId?: string | null;
  acceptTerms: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResult {
  user: UserSummary;
  accessToken: string;
  refreshToken: string;
}

// Dummy hash chuẩn bcrypt dùng để ngăn tấn công Timing Attack / User Enumeration khi email không tồn tại
const DUMMY_HASH = '$2a$10$wN1g475fV9eM68KeqV892exh9c5oK20dsmxZkVY6X9X9u6lR9rL2q';
// Khoảng thời gian ân hạn (grace period) cho refresh token (15 giây) để xử lý đa tab refresh đồng thời
const REFRESH_GRACE_PERIOD_MS = 15_000;

export class AuthService {
  static async register(dto: RegisterDto): Promise<AuthResult> {
    if (!dto.acceptTerms) {
      throw new BadRequestError('Bạn cần đồng ý với điều khoản để tạo tài khoản.', {
        acceptTerms: 'Bạn cần đồng ý với điều khoản để tạo tài khoản.',
      });
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    // Kiểm tra email trùng
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictError('Email này đã được sử dụng.', {
        email: 'Email đã được sử dụng.',
      });
    }

    // Kiểm tra trường học nếu có truyền lên
    if (dto.universityId) {
      const university = await prisma.university.findUnique({
        where: { id: dto.universityId },
      });
      if (!university) {
        throw new BadRequestError('Trường học đã chọn không hợp lệ.', {
          universityId: 'Trường học không tồn tại.',
        });
      }
    }

    const passwordHash = await hashPassword(dto.password);

    // Tạo User kèm Profile ban đầu
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName: dto.fullName.trim(),
        studentId: dto.studentId ? dto.studentId.trim() : null,
        universityId: dto.universityId,
        role: Role.USER,
        status: UserStatus.ACTIVE,
        profileCompleted: false, // Ban đầu chưa có ngành (major) nên false
        profile: {
          create: {
            bio: '',
            skills: [],
            interests: [],
          },
        },
      },
    });

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Lưu refresh token vào DB (thời hạn 7 ngày)
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(dto: LoginDto): Promise<AuthResult> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        profile: {
          select: { majorId: true },
        },
      },
    });

    // Luôn chạy comparePassword (dù user có tồn tại hay không) để tránh chênh lệch thời gian phản hồi (Timing difference)
    const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
    const isMatch = await comparePassword(dto.password, hashToCompare);

    if (!user || !isMatch) {
      throw new UnauthorizedError('Email hoặc mật khẩu không chính xác.');
    }

    // Chỉ kiểm tra status sau khi mật khẩu đã khớp đúng
    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // profileCompleted: true khi đã có cả trường và ngành
    const isProfileCompleted = Boolean(user.universityId && user.profile?.majorId);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        profileCompleted: isProfileCompleted,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refresh(rawRefreshToken: string): Promise<AuthResult> {
    const payload = verifyRefreshToken(rawRefreshToken);
    const hashed = hashToken(rawRefreshToken);

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashed },
      include: { user: { include: { profile: { select: { majorId: true } } } } },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
    }

    // Nếu token đã bị thu hồi trước đó
    if (tokenRecord.revokedAt !== null) {
      const revokedElapsed = Date.now() - tokenRecord.revokedAt.getTime();
      // Nếu thời gian thu hồi vượt quá khoảng ân hạn (grace period) -> Tấn công tái sử dụng (Token Reuse Attack)
      if (revokedElapsed > REFRESH_GRACE_PERIOD_MS) {
        await prisma.refreshToken.updateMany({
          where: { userId: payload.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedError('Phát hiện nghi vấn rò rỉ phiên. Vui lòng đăng nhập lại.');
      }
      // Nếu trong khoảng ân hạn (do nhiều tab trình duyệt refresh đồng thời), tiếp tục cấp token
    } else {
      // Thực hiện thu hồi atomic: chỉ update nếu revokedAt vẫn đang là null
      const updated = await prisma.refreshToken.updateMany({
        where: { id: tokenRecord.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (updated.count === 0) {
        // Có request khác vừa claim token này ngay trước tích tắc
        const reloaded = await prisma.refreshToken.findUnique({ where: { id: tokenRecord.id } });
        if (!reloaded || (reloaded.revokedAt && Date.now() - reloaded.revokedAt.getTime() > REFRESH_GRACE_PERIOD_MS)) {
          throw new UnauthorizedError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
        }
      }
    }

    const user = tokenRecord.user;
    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenError('Tài khoản của bạn đã bị khóa.');
    }

    const newPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(newRefreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const isProfileCompleted = Boolean(user.universityId && user.profile?.majorId);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        profileCompleted: isProfileCompleted,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(rawRefreshToken?: string): Promise<void> {
    if (rawRefreshToken) {
      const hashed = hashToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashed, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  static async getMe(userId: string): Promise<UserSummary> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { select: { majorId: true } } },
    });

    if (!user) {
      throw new NotFoundError('Không tìm thấy thông tin người dùng.');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      profileCompleted: Boolean(user.universityId && user.profile?.majorId),
    };
  }

  static async forgotPassword(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Để tránh dò tìm email, vẫn trả về thông báo chung
      return { message: 'Nếu email tồn tại trong hệ thống, mã OTP đặt lại mật khẩu đã được gửi.' };
    }

    const now = new Date();
    const cooldownThreshold = new Date(now.getTime() - 60 * 1000);
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        type: ResetTokenType.OTP,
        createdAt: { gt: cooldownThreshold },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentToken) {
      throw new TooManyRequestsError('Vui lòng đợi 60 giây trước khi yêu cầu mã OTP mới.');
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const tokenHash = hashToken(`otp:${user.id}:${otp}`);

    // Vô hiệu hóa các OTP cũ chưa dùng và tạo OTP mới (hạn 5 phút)
    await prisma.$transaction([
      prisma.passwordResetToken.updateMany({
        where: { userId: user.id, type: ResetTokenType.OTP, usedAt: null },
        data: { usedAt: now },
      }),
      prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          type: ResetTokenType.OTP,
          expiresAt: new Date(now.getTime() + 5 * 60 * 1000),
        },
      }),
    ]);

    await sendResetOtpEmail(user.email, otp);

    return {
      message: 'Nếu email tồn tại trong hệ thống, mã OTP đặt lại mật khẩu đã được gửi.',
    };
  }

  static async verifyResetOtp(email: string, otp: string): Promise<{ resetToken: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new BadRequestError('Mã OTP không hợp lệ hoặc đã hết hạn.');
    }

    const now = new Date();
    const record = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        type: ResetTokenType.OTP,
        usedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestError('Mã OTP không hợp lệ hoặc đã hết hạn.');
    }

    const inputHash = hashToken(`otp:${user.id}:${otp}`);
    const inputBuffer = Buffer.from(inputHash, 'hex');
    const storedBuffer = Buffer.from(record.tokenHash, 'hex');
    const isMatch =
      inputBuffer.length === storedBuffer.length && crypto.timingSafeEqual(inputBuffer, storedBuffer);

    if (!isMatch) {
      const updated = await prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });

      if (updated.attempts >= 5) {
        await prisma.passwordResetToken.updateMany({
          where: { id: record.id, usedAt: null },
          data: { usedAt: new Date() },
        });
        throw new BadRequestError('Bạn đã nhập sai OTP quá 5 lần. Mã đã bị hủy, vui lòng yêu cầu mã mới.');
      }

      throw new BadRequestError(`Mã OTP không chính xác. Bạn còn ${5 - updated.attempts} lần thử.`);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashToken(`reset:${resetToken}`);

    await prisma.$transaction(async (tx) => {
      const claimed = await tx.passwordResetToken.updateMany({
        where: {
          id: record.id,
          type: ResetTokenType.OTP,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });

      if (claimed.count === 0) {
        throw new BadRequestError('Mã OTP không hợp lệ hoặc đã hết hạn.');
      }

      await tx.passwordResetToken.create({
        data: {
          tokenHash: resetTokenHash,
          userId: user.id,
          type: ResetTokenType.RESET,
          expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
        },
      });
    });

    return { resetToken };
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      throw new BadRequestError('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    }

    const now = new Date();
    const tokenHash = hashToken(`reset:${token}`);

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (
      !record ||
      record.type !== ResetTokenType.RESET ||
      record.usedAt !== null ||
      record.expiresAt < now
    ) {
      throw new BadRequestError('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction(async (tx) => {
      const claimed = await tx.passwordResetToken.updateMany({
        where: {
          id: record.id,
          type: ResetTokenType.RESET,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });

      if (claimed.count === 0) {
        throw new BadRequestError('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      }

      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      });

      // Thu hồi tất cả refresh tokens để buộc đăng nhập lại
      await tx.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: now },
      });
    });
  }
}
