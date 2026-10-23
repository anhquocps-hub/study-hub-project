/**
 * Mock Auth API, dùng khi VITE_USE_MOCK_API=true.
 * Có cùng tên hàm và kiểu trả về với auth-api.ts nên component không cần biết đang dùng bản nào.
 *
 * Tài khoản demo: demo@studyhub.vn / demo1234.
 * Tài khoản đăng ký mới chỉ sống trong bộ nhớ của tab: F5 thì mất tài khoản nhưng vẫn giữ phiên.
 */
import { ApiError } from '../../../services/http-client';
import { userSchema, type LoginInput, type RegisterInput, type User } from '../model/auth-schemas';

const SESSION_KEY = 'study-hub-mock-session';
const DEMO_PASSWORD = 'demo1234';

const demoUser: User = {
  id: 'u-demo',
  email: 'demo@studyhub.vn',
  fullName: 'Sinh viên Demo',
  role: 'USER',
  profileCompleted: true,
};

// Mật khẩu mock chỉ giữ trong bộ nhớ, không ghi vào storage.
const accounts = new Map<string, { user: User; password: string }>([
  [demoUser.email, { user: demoUser, password: DEMO_PASSWORD }],
]);

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

function saveSession(user: User) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export async function login(input: LoginInput): Promise<User> {
  await delay();
  const account = accounts.get(input.email);
  if (!account || account.password !== input.password) {
    throw new ApiError(401, 'Email hoặc mật khẩu không đúng.');
  }
  saveSession(account.user);
  return account.user;
}

export async function register(input: RegisterInput): Promise<User> {
  await delay();
  if (accounts.has(input.email)) {
    throw new ApiError(409, 'Email đã được sử dụng.', { email: 'Email này đã có tài khoản.' });
  }
  const user: User = {
    id: crypto.randomUUID(),
    email: input.email,
    fullName: input.fullName,
    role: 'USER',
    profileCompleted: false, // mới có trường, chưa có ngành
  };
  accounts.set(user.email, { user, password: input.password });
  saveSession(user);
  return user;
}

export async function logout(): Promise<void> {
  await delay(200);
  sessionStorage.removeItem(SESSION_KEY);
}

export async function getMe(): Promise<User | null> {
  await delay(200);
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = userSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null; // dữ liệu hỏng thì coi như chưa đăng nhập
  }
}
