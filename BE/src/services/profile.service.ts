import { prisma } from '../db/client.js';
import { NotFoundError } from '../utils/errors.js';

export interface UpdateProfileDto {
  fullName?: string;
  universityId?: string;
  majorId?: string;
  cohort?: string | null;
  studentId?: string | null;
  bio?: string;
  skills?: Array<{ name: string; level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' }>;
  interests?: string[];
  links?: {
    github?: string | null;
    linkedin?: string | null;
    portfolio?: string | null;
  };
}

export class ProfileService {
  /**
   * Lấy hồ sơ người dùng.
   * Quy ước bảo mật: `studentId` chỉ trả về cho chính chủ hoặc admin; người khác xem sẽ nhận giá trị null.
   */
  static async getProfile(targetUserId: string, currentUserId?: string, isAdmin = false) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        university: { select: { id: true, name: true } },
        profile: {
          include: {
            major: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng này.');
    }

    const profile = user.profile;
    const isOwner = currentUserId === user.id || isAdmin;

    // Chuẩn hóa links
    const links = {
      github: profile?.githubUrl ?? null,
      linkedin: profile?.linkedinUrl ?? null,
      portfolio: profile?.portfolioUrl ?? null,
    };

    // Chuẩn hóa skills và interests từ Json
    const skills = Array.isArray(profile?.skills) ? profile.skills : [];
    const interests = Array.isArray(profile?.interests) ? profile.interests : [];

    return {
      userId: user.id,
      fullName: user.fullName,
      avatarUrl: profile?.avatarUrl ?? null,
      studentId: isOwner ? user.studentId : null,
      university: user.university ? { id: user.university.id, name: user.university.name } : null,
      major: profile?.major ? { id: profile.major.id, name: profile.major.name } : null,
      cohort: profile?.cohort ?? null,
      bio: profile?.bio ?? '',
      skills,
      interests,
      links,
      projects: [], // Khởi tạo mảng rỗng cho đến khi module Space/Project ghép vào
    };
  }

  /**
   * Cập nhật hồ sơ của chính người dùng đang đăng nhập.
   */
  static async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng.');
    }

    // 1. Cập nhật thông tin cấp User (fullName, studentId, universityId)
    const userUpdateData: Record<string, unknown> = {};
    if (dto.fullName !== undefined) userUpdateData.fullName = dto.fullName.trim();
    if (dto.studentId !== undefined) userUpdateData.studentId = dto.studentId ? dto.studentId.trim() : null;
    if (dto.universityId !== undefined) userUpdateData.universityId = dto.universityId;

    // Kiểm tra nếu đã có cả universityId và majorId thì đánh dấu profileCompleted = true
    const nextUniversityId = dto.universityId !== undefined ? dto.universityId : user.universityId;
    const nextMajorId = dto.majorId !== undefined ? dto.majorId : user.profile?.majorId;
    if (nextUniversityId && nextMajorId) {
      userUpdateData.profileCompleted = true;
    }

    // 2. Cập nhật thông tin cấp Profile
    const profileUpdateData: Record<string, unknown> = {};
    if (dto.majorId !== undefined) profileUpdateData.majorId = dto.majorId;
    if (dto.cohort !== undefined) profileUpdateData.cohort = dto.cohort;
    if (dto.bio !== undefined) profileUpdateData.bio = dto.bio;
    if (dto.skills !== undefined) profileUpdateData.skills = dto.skills;
    if (dto.interests !== undefined) profileUpdateData.interests = dto.interests;
    if (dto.links) {
      if (dto.links.github !== undefined) profileUpdateData.githubUrl = dto.links.github;
      if (dto.links.linkedin !== undefined) profileUpdateData.linkedinUrl = dto.links.linkedin;
      if (dto.links.portfolio !== undefined) profileUpdateData.portfolioUrl = dto.links.portfolio;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      }),
      prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          bio: dto.bio ?? '',
          cohort: dto.cohort ?? null,
          majorId: dto.majorId ?? null,
          skills: dto.skills ?? [],
          interests: dto.interests ?? [],
          githubUrl: dto.links?.github ?? null,
          linkedinUrl: dto.links?.linkedin ?? null,
          portfolioUrl: dto.links?.portfolio ?? null,
        },
        update: profileUpdateData,
      }),
    ]);

    return this.getProfile(userId, userId, false);
  }
}
