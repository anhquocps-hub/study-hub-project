/**
 * Cơ sở dữ liệu giả dùng chung cho các file *.mock.ts (chỉ chạy khi VITE_USE_MOCK_API=true).
 *
 * - Tài khoản và hồ sơ được lưu trong sessionStorage của tab, nên F5 vẫn còn.
 * - Mật khẩu chỉ giữ trong bộ nhớ, không ghi vào storage: tài khoản tự đăng ký sẽ không đăng nhập lại
 *   được sau khi F5 và đăng xuất. Tài khoản mẫu luôn dùng mật khẩu demo1234.
 * - Muốn về dữ liệu ban đầu: đóng tab hoặc xóa Session Storage trong DevTools.
 */
import type { Major, University } from '../features/academic';
import type { User } from '../features/auth';
import type { Profile } from '../features/profiles';

const DB_KEY = 'study-hub-mock-db';
const SESSION_KEY = 'study-hub-mock-session';
export const MOCK_DEMO_PASSWORD = 'demo1234';

export const MOCK_UNIVERSITIES: University[] = [
  { id: 'hcmute', name: 'ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)' },
  { id: 'uit', name: 'ĐH Công nghệ Thông tin – ĐHQG-HCM (UIT)' },
  { id: 'hcmut', name: 'ĐH Bách khoa – ĐHQG-HCM (HCMUT)' },
  { id: 'hcmus', name: 'ĐH Khoa học Tự nhiên – ĐHQG-HCM (HCMUS)' },
  { id: 'ueh', name: 'ĐH Kinh tế TP.HCM (UEH)' },
];

const IT_MAJORS: Major[] = [
  { id: 'se', name: 'Kỹ thuật phần mềm' },
  { id: 'cs', name: 'Khoa học máy tính' },
  { id: 'is', name: 'Hệ thống thông tin' },
  { id: 'ai', name: 'Trí tuệ nhân tạo' },
  { id: 'ns', name: 'An toàn thông tin' },
];

/** Ngành theo từng trường (mã trường → danh sách ngành). */
export const MOCK_MAJORS: Record<string, Major[]> = {
  hcmute: IT_MAJORS,
  uit: IT_MAJORS,
  hcmut: IT_MAJORS,
  hcmus: IT_MAJORS,
  ueh: [
    { id: 'ba', name: 'Quản trị kinh doanh' },
    { id: 'mkt', name: 'Marketing' },
    { id: 'fin', name: 'Tài chính – Ngân hàng' },
  ],
};

interface StoredAccount {
  email: string;
  role: User['role'];
  profile: Profile;
}

const SEED: StoredAccount[] = [
  {
    email: 'demo@studyhub.vn',
    role: 'USER',
    profile: {
      userId: 'u-demo',
      fullName: 'Sinh viên Demo',
      avatarUrl: null,
      studentId: '21110034',
      university: { id: 'hcmute', name: 'ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)' },
      major: { id: 'se', name: 'Kỹ thuật phần mềm' },
      cohort: 'K21',
      bio: 'Sinh viên năm 3 ngành Kỹ thuật phần mềm. Thích làm web với React và TypeScript, đang tìm đồng đội Backend cho đồ án chuyên ngành.',
      skills: [
        { name: 'React', level: 'ADVANCED' },
        { name: 'TypeScript', level: 'INTERMEDIATE' },
        { name: 'Figma', level: 'INTERMEDIATE' },
        { name: 'Docker', level: 'BEGINNER' },
      ],
      interests: ['Web', 'UI/UX', 'EdTech'],
      links: { github: 'https://github.com/studyhub-demo', linkedin: null, portfolio: 'https://studyhub-demo.dev' },
      projects: [{ id: 'p-expense', name: 'Expense Tracker – Web quản lý chi tiêu sinh viên', role: 'Frontend Developer' }],
    },
  },
  {
    email: 'yennhi@studyhub.vn',
    role: 'USER',
    profile: {
      userId: 'u-khac',
      fullName: 'Lê Hoàng Yến Nhi',
      avatarUrl: null,
      studentId: '21110892',
      university: { id: 'hcmute', name: 'ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)' },
      major: { id: 'se', name: 'Kỹ thuật phần mềm' },
      cohort: 'K21',
      bio: '',
      skills: [
        { name: 'Figma', level: 'ADVANCED' },
        { name: 'React', level: 'INTERMEDIATE' },
      ],
      interests: [],
      links: { github: null, linkedin: 'https://linkedin.com/in/yennhi-demo', portfolio: null },
      projects: [],
    },
  },
];

// Mật khẩu: chỉ trong bộ nhớ (xem ghi chú đầu file)
const passwords = new Map<string, string>(SEED.map((account) => [account.profile.userId, MOCK_DEMO_PASSWORD]));

function load(): StoredAccount[] {
  try {
    const raw = sessionStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as StoredAccount[];
  } catch {
    // dữ liệu hỏng: dùng lại dữ liệu mẫu
  }
  return structuredClone(SEED);
}

function save(accounts: StoredAccount[]) {
  sessionStorage.setItem(DB_KEY, JSON.stringify(accounts));
}

function toUser(account: StoredAccount): User {
  const { profile } = account;
  return {
    id: profile.userId,
    email: account.email,
    fullName: profile.fullName,
    role: account.role,
    profileCompleted: Boolean(profile.university && profile.major),
  };
}

export const mockDb = {
  delay(ms = 400) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  findUserByEmail(email: string): User | null {
    const account = load().find((item) => item.email === email);
    return account ? toUser(account) : null;
  },

  findUserById(userId: string): User | null {
    const account = load().find((item) => item.profile.userId === userId);
    return account ? toUser(account) : null;
  },

  checkPassword(userId: string, password: string): boolean {
    return passwords.get(userId) === password;
  },

  createAccount(input: { email: string; password: string; profile: Profile }): User {
    const accounts = load();
    const account: StoredAccount = { email: input.email, role: 'USER', profile: input.profile };
    accounts.push(account);
    save(accounts);
    passwords.set(input.profile.userId, input.password);
    return toUser(account);
  },

  getProfile(userId: string): Profile | null {
    return load().find((item) => item.profile.userId === userId)?.profile ?? null;
  },

  saveProfile(profile: Profile): Profile {
    const accounts = load();
    const account = accounts.find((item) => item.profile.userId === profile.userId);
    if (account) account.profile = profile;
    save(accounts);
    return profile;
  },

  session: {
    getUserId(): string | null {
      return sessionStorage.getItem(SESSION_KEY);
    },
    start(userId: string) {
      sessionStorage.setItem(SESSION_KEY, userId);
    },
    end() {
      sessionStorage.removeItem(SESSION_KEY);
    },
  },
};
