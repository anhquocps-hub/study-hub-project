import { prisma } from '../db/client.js';

export interface UniversityDto {
  id: string;
  name: string;
}

export interface MajorDto {
  id: string;
  name: string;
}

export class AcademicService {
  static async getUniversities(): Promise<UniversityDto[]> {
    return prisma.university.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  static async getMajors(universityId?: string): Promise<MajorDto[]> {
    if (!universityId) {
      return prisma.major.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
    }

    return prisma.major.findMany({
      where: { universityId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}
