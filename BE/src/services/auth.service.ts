import crypto from 'node:crypto';
import { Role, UserStatus } from '@prisma/client';
import { prisma } from '../db/client.js';
import { TokenPayload, UserSummary } from '../types/auth.types.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

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

    if (!user) {
      throw new UnauthorizedError('Email hoặc mật khẩu không chính xác.');
    }

    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    const isMatch = await comparePassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Email hoặc mật khẩu không chính xác.');
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

    // Phát hiện Refresh Token bị dùng lại (Token Reuse Detection) hoặc đã bị thu hồi
    if (!tokenRecord || tokenRecord.revokedAt !== null || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord && tokenRecord.revokedAt !== null) {
        // Khả năng rò rỉ token: Thu hồi toàn bộ session của user này để bảo vệ
        await prisma.refreshToken.updateMany({
          where: { userId: payload.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
    }

    // Thu hồi token cũ (Token Rotation)
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

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

  static async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Để tránh dò tìm email, vẫn trả về thông báo chung
      return { message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(resetToken);

    // Lưu token có hạn 30 phút
    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    // Trong môi trường dev, có thể trả về resetToken để tiện test
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.',
      ...(isProduction ? {} : { resetToken }),
    };
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt !== null || record.expiresAt < new Date()) {
      throw new BadRequestError('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // Thu hồi tất cả refresh tokens để buộc đăng nhập lại
      prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }
}
