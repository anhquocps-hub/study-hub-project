import { Role, UserStatus } from '@prisma/client';
import { prisma } from './client.js';
import { hashPassword } from '../utils/hash.js';

const UNIVERSITIES = [
  { id: 'hcmute', name: 'ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)' },
  { id: 'uit', name: 'ĐH Công nghệ Thông tin – ĐHQG-HCM (UIT)' },
  { id: 'hcmut', name: 'ĐH Bách khoa – ĐHQG-HCM (HCMUT)' },
  { id: 'hcmus', name: 'ĐH Khoa học Tự nhiên – ĐHQG-HCM (HCMUS)' },
  { id: 'ueh', name: 'ĐH Kinh tế TP.HCM (UEH)' },
];

const IT_MAJORS = [
  { id: 'se', name: 'Kỹ thuật phần mềm' },
  { id: 'cs', name: 'Khoa học máy tính' },
  { id: 'is', name: 'Hệ thống thông tin' },
  { id: 'ai', name: 'Trí tuệ nhân tạo' },
  { id: 'ns', name: 'An toàn thông tin' },
];

const UEH_MAJORS = [
  { id: 'ba', name: 'Quản trị kinh doanh' },
  { id: 'mkt', name: 'Marketing' },
  { id: 'fin', name: 'Tài chính – Ngân hàng' },
];

export async function seed() {
  console.log('--- Bắt đầu Seeding Dữ liệu Study Hub ---');

  // 1. Seed Universities
  for (const uni of UNIVERSITIES) {
    await prisma.university.upsert({
      where: { id: uni.id },
      update: { name: uni.name },
      create: uni,
    });
  }
  console.log('✓ Seed danh sách trường đại học thành công');

  // 2. Seed Majors
  for (const uni of ['hcmute', 'uit', 'hcmut', 'hcmus']) {
    for (const m of IT_MAJORS) {
      const majorId = `${uni}_${m.id}`;
      await prisma.major.upsert({
        where: { id: majorId },
        update: { name: m.name },
        create: {
          id: majorId,
          name: m.name,
          universityId: uni,
        },
      });
    }
  }

  for (const m of UEH_MAJORS) {
    const majorId = `ueh_${m.id}`;
    await prisma.major.upsert({
      where: { id: majorId },
      update: { name: m.name },
      create: {
        id: majorId,
        name: m.name,
        universityId: 'ueh',
      },
    });
  }
  console.log('✓ Seed danh sách ngành học thành công');

  // 3. Seed Admin & Demo Users
  const defaultPasswordHash = await hashPassword('demo1234');

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@studyhub.vn' },
    update: {},
    create: {
      email: 'admin@studyhub.vn',
      passwordHash: defaultPasswordHash,
      fullName: 'Quản trị viên Hệ thống',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      universityId: 'hcmute',
      profileCompleted: true,
      profile: {
        create: {
          bio: 'Hệ thống quản trị UniSpace / Study Hub',
          majorId: 'hcmute_se',
          cohort: 'Staff',
        },
      },
    },
  });
  console.log(`✓ Seed tài khoản Admin (${admin.email} / demo1234)`);

  // Demo Student user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@studyhub.vn' },
    update: {},
    create: {
      email: 'demo@studyhub.vn',
      passwordHash: defaultPasswordHash,
      fullName: 'Sinh viên Demo',
      studentId: '21110034',
      role: Role.USER,
      status: UserStatus.ACTIVE,
      universityId: 'hcmute',
      profileCompleted: true,
      profile: {
        create: {
          bio: 'Sinh viên năm 3 ngành Kỹ thuật phần mềm. Thích làm web với React và TypeScript.',
          majorId: 'hcmute_se',
          cohort: 'K21',
          skills: [
            { name: 'React', level: 'ADVANCED' },
            { name: 'TypeScript', level: 'INTERMEDIATE' },
            { name: 'Node.js', level: 'INTERMEDIATE' },
            { name: 'PostgreSQL', level: 'BEGINNER' },
          ],
          interests: ['Web Development', 'UI/UX', 'Cloud'],
          githubUrl: 'https://github.com/studyhub-demo',
          portfolioUrl: 'https://studyhub-demo.dev',
        },
      },
    },
  });
  console.log(`✓ Seed tài khoản Demo (${demoUser.email} / demo1234)`);

  console.log('--- Hoàn tất Seeding ---');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
