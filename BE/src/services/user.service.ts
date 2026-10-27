import { Role, UserStatus } from '@prisma/client';
import { prisma } from '../db/client.js';
import { NotFoundError } from '../utils/errors.js';

export interface UserQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
}

export class UserService {
  static async listUsers(options: UserQueryOptions) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.max(1, Math.min(100, options.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (options.role) {
      where.role = options.role;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.search) {
      where.OR = [
        { fullName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { studentId: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          studentId: true,
          role: true,
          status: true,
          profileCompleted: true,
          createdAt: true,
          university: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        studentId: true,
        role: true,
        status: true,
        profileCompleted: true,
        createdAt: true,
        university: { select: { id: true, name: true } },
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng này.');
    }

    return user;
  }

  static async updateUserStatus(userId: string, status: UserStatus) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng.');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, email: true, fullName: true, role: true, status: true },
    });
  }

  static async updateUserRole(userId: string, role: Role) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng.');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, fullName: true, role: true, status: true },
    });
  }
}
