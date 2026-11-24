/**
 * Dữ liệu giả cho trang Admin quản lý người dùng (chỉ dùng khi VITE_USE_MOCK_API=true).
 * - 5 người đầu đúng như thiết kế Figma; phần còn lại sinh tất định (không ngẫu nhiên) để đủ phân trang và lọc.
 * - MOCK_USER_EXTRAS: trường mở rộng mà BE chưa có, cho mọi tài khoản trong mock.
 * Các tài khoản ở đây không có mật khẩu nên không đăng nhập được.
 */
import { EMPTY_EXTRAS, type AdminUserExtras, type DirectoryStats } from '../features/admin-users/model/admin-user-schemas';
import type { StoredAccount } from './mock-db';

const HCMUTE = { id: 'hcmute', name: 'ĐH Sư Phạm Kỹ Thuật (HCMUTE)' };
const HCMUT = { id: 'hcmut', name: 'ĐH Bách Khoa TP.HCM (HCMUT)' };
const UIT = { id: 'uit', name: 'ĐH Công nghệ Thông tin – ĐHQG-HCM (UIT)' };
const HCMUS = { id: 'hcmus', name: 'ĐH Khoa học Tự nhiên – ĐHQG-HCM (HCMUS)' };
const UEH = { id: 'ueh', name: 'ĐH Kinh tế TP.HCM (UEH)' };

function account(input: {
  id: string;
  email: string;
  fullName: string;
  studentId: string | null;
  university: { id: string; name: string } | null;
  cohort: string | null;
  createdAt: string;
  role?: StoredAccount['role'];
  status?: StoredAccount['status'];
}): StoredAccount {
  return {
    email: input.email,
    role: input.role ?? 'USER',
    status: input.status ?? 'ACTIVE',
    createdAt: input.createdAt,
    profile: {
      userId: input.id,
      fullName: input.fullName,
      avatarUrl: null,
      studentId: input.studentId,
      university: input.university,
      major: null,
      cohort: input.cohort,
      bio: '',
      skills: [],
      interests: [],
      links: { github: null, linkedin: null, portfolio: null },
      projects: [],
    },
  };
}

// ——— 5 người dùng trong thiết kế (frame 25:5350) ———
const DESIGN_ACCOUNTS: StoredAccount[] = [
  account({
    id: 'u-minh-tuan',
    email: '21110782@student.hcmute.edu.vn',
    fullName: 'Minh Tuấn',
    studentId: '21110782',
    university: HCMUTE,
    cohort: 'K21',
    createdAt: '2021-09-18T07:22:05.000Z',
  }),
  account({
    id: 'u-le-van-t',
    email: 'levant.2111029x@student.hcmute.edu.vn',
    fullName: 'Lê Văn T.',
    studentId: '2111029x',
    university: HCMUTE,
    cohort: 'K21',
    createdAt: '2022-03-02T02:14:10.000Z',
  }),
  account({
    id: 'u-thay-a',
    email: 'anv@hcmute.edu.vn',
    fullName: 'ThS. Nguyễn Văn A',
    studentId: null,
    university: HCMUTE,
    cohort: null,
    createdAt: '2021-08-10T01:00:00.000Z',
  }),
  account({
    id: 'u-pham-h',
    email: 'pham.hoang@hcmut.edu.vn',
    fullName: 'Phạm H.',
    studentId: '2013891',
    university: HCMUT,
    cohort: 'K20',
    createdAt: '2022-10-15T12:40:12.000Z',
  }),
  account({
    id: 'u-tran-thi-nga',
    email: '22134019@student.hcmute.edu.vn',
    fullName: 'Trần Thị Nga',
    studentId: '22134019',
    university: HCMUTE,
    cohort: 'K22',
    createdAt: '2022-09-05T03:15:22.000Z',
  }),
];

const DESIGN_EXTRAS: Record<string, AdminUserExtras> = {
  'u-minh-tuan': {
    ...EMPTY_EXTRAS,
    cohort: 'K21',
    faculty: 'Khoa CNTT - CNPM CLC',
    className: '21110CL1A',
    skills: ['React', 'Node.js', 'Leader'],
    trustScore: 98,
    violationSummary: '0 vi phạm',
  },
  'u-le-van-t': {
    ...EMPTY_EXTRAS,
    username: 'user_4912',
    cohort: 'K21 Điện-Điện tử',
    faculty: 'Khoa Điện - Tự động hóa',
    highlight: 'Lý do: Spam link bán tool đồ án thương mại',
    skills: ['C/C++', 'Arduino', 'Flagged'],
    trustScore: 24,
    violationSummary: '5 báo cáo',
    moderation: { kind: 'TEMP_BAN', label: 'Tạm khóa 7 ngày', detail: 'Còn lại 4 ngày 12h' },
  },
  'u-thay-a': {
    ...EMPTY_EXTRAS,
    title: 'Giảng viên',
    faculty: 'Bộ môn Hệ thống Thông tin',
    className: 'Mã GV: GV01029',
    highlight: 'Owner: Space CSDL IT204',
    skills: ['Database', 'PostgreSQL', 'BigData'],
    trustScore: 100,
    violationSummary: 'Verified SV',
    moderation: { kind: 'VERIFIED', label: 'Xác thực Giảng viên', detail: null },
  },
  'u-pham-h': {
    ...EMPTY_EXTRAS,
    username: 'user_3019',
    cohort: 'Khoa KH&KT Máy tính',
    faculty: 'Khoa Khoa học & Kỹ thuật Máy tính',
    highlight: 'Hủy kèo nhóm 3 lần sát deadline',
    skills: ['Python', 'Django', 'Docker'],
    trustScore: 58,
    violationSummary: '2 cảnh cáo',
    moderation: { kind: 'WARNING', label: '2 Gậy Cảnh Cáo 🟡', detail: null },
  },
  'u-tran-thi-nga': {
    ...EMPTY_EXTRAS,
    cohort: 'K22 Ngoại ngữ',
    faculty: 'Khoa Ngoại ngữ - Tiếng Anh Thương mại',
    highlight: 'GPA: 3.65 • Top Guild Lead',
    skills: ['IELTS 8.0', 'Content', 'Figma'],
    trustScore: 96,
    violationSummary: '0 vi phạm',
    moderation: { kind: 'ACTIVE_POSITIVE', label: 'Hoạt động tích cực 🟢', detail: null },
  },
};

// ——— Người dùng sinh tất định ———
const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Võ', 'Đặng', 'Bùi', 'Đỗ'];
const MIDDLE_NAMES = ['Văn', 'Thị', 'Minh', 'Gia', 'Hoàng', 'Ngọc'];
const FIRST_NAMES = ['An', 'Bình', 'Châu', 'Dũng', 'Giang', 'Hà', 'Khánh', 'Linh', 'Nam', 'Phúc', 'Quân', 'Thảo', 'Vy'];
const UNIVERSITIES = [HCMUTE, UIT, HCMUT, HCMUS, UEH];
const FACULTIES = ['Khoa Công nghệ Thông tin', 'Khoa Điện - Điện tử', 'Khoa Cơ khí', 'Khoa Kinh tế', 'Khoa Ngoại ngữ'];
const SKILL_SETS = [
  ['React', 'TypeScript'],
  ['Java', 'Spring'],
  ['Python', 'ML'],
  ['Figma', 'UI/UX'],
  ['Go', 'PostgreSQL'],
  ['Flutter', 'Firebase'],
];
const GENERATED_COUNT = 45;

const GENERATED_ACCOUNTS: StoredAccount[] = [];
const GENERATED_EXTRAS: Record<string, AdminUserExtras> = {};

for (let i = 0; i < GENERATED_COUNT; i += 1) {
  const id = `u-gen-${String(i + 1).padStart(2, '0')}`;
  const cohortYear = 20 + (i % 5);
  const studentId = `${cohortYear}1${String(10000 + i * 37).slice(-5)}`;
  const university = UNIVERSITIES[i % UNIVERSITIES.length];
  const fullName = `${LAST_NAMES[i % LAST_NAMES.length]} ${MIDDLE_NAMES[i % MIDDLE_NAMES.length]} ${FIRST_NAMES[i % FIRST_NAMES.length]}`;
  const isBanned = i % 11 === 5;
  const isAdmin = i === 7;
  // Ngày tạo lùi dần mỗi người 9 ngày tính từ 2025-10-01.
  const createdAt = new Date(Date.UTC(2025, 9, 1) - i * 9 * 24 * 60 * 60 * 1000).toISOString();

  GENERATED_ACCOUNTS.push(
    account({
      id,
      email: `${studentId}@student.${university.id}.edu.vn`,
      fullName,
      studentId,
      university,
      cohort: `K${cohortYear}`,
      createdAt,
      role: isAdmin ? 'ADMIN' : 'USER',
      status: isBanned ? 'BANNED' : 'ACTIVE',
    }),
  );

  const warned = !isBanned && i % 9 === 4;
  GENERATED_EXTRAS[id] = {
    ...EMPTY_EXTRAS,
    cohort: `K${cohortYear}`,
    faculty: FACULTIES[i % FACULTIES.length],
    className: `${cohortYear}110CL${(i % 3) + 1}`,
    skills: SKILL_SETS[i % SKILL_SETS.length],
    trustScore: isBanned ? 12 + (i % 10) : warned ? 55 + (i % 10) : 80 + (i % 20),
    violationSummary: isBanned ? `${3 + (i % 4)} báo cáo` : warned ? '1 cảnh cáo' : '0 vi phạm',
    moderation: warned ? { kind: 'WARNING', label: '1 Gậy Cảnh Cáo 🟡', detail: null } : null,
  };
}

/** Tài khoản thêm vào mock-db (ngoài các tài khoản đăng nhập được). */
export const MOCK_DIRECTORY_ACCOUNTS: StoredAccount[] = [...DESIGN_ACCOUNTS, ...GENERATED_ACCOUNTS];

/** Trường mở rộng theo userId, gồm cả tài khoản đăng nhập được trong mock-db. */
export const MOCK_USER_EXTRAS: Record<string, AdminUserExtras> = {
  'u-demo': {
    ...EMPTY_EXTRAS,
    cohort: 'K21',
    faculty: 'Khoa Công nghệ Thông tin',
    className: '21110CL2B',
    skills: ['React', 'TypeScript', 'Figma'],
    trustScore: 92,
    violationSummary: '0 vi phạm',
  },
  'u-khac': {
    ...EMPTY_EXTRAS,
    cohort: 'K21',
    faculty: 'Khoa Công nghệ Thông tin',
    className: '21110CL1A',
    skills: ['Figma', 'React'],
    trustScore: 88,
    violationSummary: '0 vi phạm',
  },
  'u-admin': {
    ...EMPTY_EXTRAS,
    title: 'Quản trị viên',
    faculty: 'Ban quản trị UniSpace',
    trustScore: 100,
    violationSummary: '0 vi phạm',
    moderation: { kind: 'VERIFIED', label: 'Quản trị hệ thống', detail: null },
  },
  ...DESIGN_EXTRAS,
  ...GENERATED_EXTRAS,
};

/** 5 ô thống kê đầu trang, số như thiết kế. */
export const MOCK_DIRECTORY_STATS: DirectoryStats = {
  total: { value: 14820, delta: '+320 t/n' },
  online: { value: 3482, ratio: '23.4%' },
  warned: { value: 38 },
  banned: { value: 19, ratio: '0.12%' },
  staff: { value: 142 },
};
