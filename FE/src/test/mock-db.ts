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
import { MOCK_DIRECTORY_ACCOUNTS } from './mock-directory';

const DB_KEY = 'unispace-mock-db';
const SESSION_KEY = 'unispace-mock-session';
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

export interface StoredAccount {
  email: string;
  role: User['role'];
  /** Trạng thái giống BE: BANNED thì không đăng nhập được. */
  status: 'ACTIVE' | 'BANNED';
  /** Ngày tạo tài khoản (ISO). */
  createdAt: string;
  profile: Profile;
}

const DEFAULT_CREATED_AT = '2024-09-01T00:00:00.000Z';

/** Tài khoản đăng nhập được (mật khẩu demo1234). */
const LOGIN_SEED: StoredAccount[] = [
  {
    email: 'demo@unispace.vn',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2024-09-05T02:30:00.000Z',
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
      links: { github: 'https://github.com/unispace-demo', linkedin: null, portfolio: 'https://unispace-demo.dev' },
      projects: [{ id: 'p-expense', name: 'Expense Tracker – Web quản lý chi tiêu sinh viên', role: 'Frontend Developer' }],
    },
  },
  {
    email: 'yennhi@unispace.vn',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2024-09-12T08:10:00.000Z',
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
  {
    email: 'admin@unispace.vn',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2024-08-01T00:00:00.000Z',
    profile: {
      userId: 'u-admin',
      fullName: 'Quản trị viên UniSpace',
      avatarUrl: null,
      studentId: null,
      university: { id: 'hcmute', name: 'ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)' },
      major: { id: 'se', name: 'Kỹ thuật phần mềm' },
      cohort: null,
      bio: '',
      skills: [],
      interests: [],
      links: { github: null, linkedin: null, portfolio: null },
      projects: [],
    },
  },
];

const SEED: StoredAccount[] = [...LOGIN_SEED, ...MOCK_DIRECTORY_ACCOUNTS];

// Mật khẩu: chỉ trong bộ nhớ (xem ghi chú đầu file)
const passwords = new Map<string, string>(LOGIN_SEED.map((account) => [account.profile.userId, MOCK_DEMO_PASSWORD]));

function load(): StoredAccount[] {
  try {
    const raw = sessionStorage.getItem(DB_KEY);
    if (raw) {
      // Dữ liệu lưu từ phiên bản cũ có thể thiếu status/createdAt: điền mặc định.
      return (JSON.parse(raw) as Partial<StoredAccount>[]).map((account) => ({
        ...account,
        status: account.status ?? 'ACTIVE',
        createdAt: account.createdAt ?? DEFAULT_CREATED_AT,
      })) as StoredAccount[];
    }
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
    const account: StoredAccount = {
      email: input.email,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      profile: input.profile,
    };
    accounts.push(account);
    save(accounts);
    passwords.set(input.profile.userId, input.password);
    return toUser(account);
  },

  /**
   * Đảm bảo có tài khoản mock cho một người dùng đến từ BE thật (khi auth gọi API thật nhưng bảng tin/chat
   * vẫn mock). Tài khoản này không có mật khẩu mock.
   */
  ensureAccount(user: User) {
    const accounts = load();
    if (accounts.some((item) => item.profile.userId === user.id)) return;
    accounts.push({
      email: user.email,
      role: user.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      profile: {
        userId: user.id,
        fullName: user.fullName,
        avatarUrl: null,
        studentId: null,
        university: null,
        major: null,
        cohort: null,
        bio: '',
        skills: [],
        interests: [],
        links: { github: null, linkedin: null, portfolio: null },
        projects: [],
      },
    });
    save(accounts);
  },

  listAccounts(): StoredAccount[] {
    return load();
  },

  getAccount(userId: string): StoredAccount | null {
    return load().find((item) => item.profile.userId === userId) ?? null;
  },

  updateAccount(userId: string, patch: Partial<Pick<StoredAccount, 'role' | 'status'>>): StoredAccount | null {
    const accounts = load();
    const account = accounts.find((item) => item.profile.userId === userId);
    if (!account) return null;
    Object.assign(account, patch);
    save(accounts);
    return account;
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
