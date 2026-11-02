/**
 * Mock Auth API, dùng khi VITE_USE_MOCK_API=true.
 * Có cùng tên hàm và kiểu trả về với auth-api.ts nên component không cần biết đang dùng bản nào.
 * Dữ liệu nằm ở src/test/mock-db.ts. Tài khoản demo: demo@studyhub.vn / demo1234.
 */
import { MOCK_UNIVERSITIES, mockDb } from '../../../test/mock-db';
import { ApiError } from '../../../services/http-client';
import type { LoginInput, RegisterInput, User } from '../model/auth-schemas';

export async function login(input: LoginInput): Promise<User> {
  await mockDb.delay(500);
  const user = mockDb.findUserByEmail(input.email);
  if (!user || !mockDb.checkPassword(user.id, input.password)) {
    throw new ApiError(401, 'Email hoặc mật khẩu không đúng.');
  }
  mockDb.session.start(user.id);
  return user;
}

export async function register(input: RegisterInput): Promise<User> {
  await mockDb.delay(500);
  if (mockDb.findUserByEmail(input.email)) {
    throw new ApiError(409, 'Email đã được sử dụng.', { email: 'Email này đã có tài khoản.' });
  }
  const university = MOCK_UNIVERSITIES.find((item) => item.id === input.universityId) ?? null;
  const user = mockDb.createAccount({
    email: input.email,
    password: input.password,
    profile: {
      userId: crypto.randomUUID(),
      fullName: input.fullName,
      avatarUrl: null,
      studentId: input.studentId === '' ? null : input.studentId,
      university,
      major: null, // chưa có ngành → profileCompleted = false → chuyển sang trang hoàn thiện hồ sơ
      cohort: null,
      bio: '',
      skills: [],
      interests: [],
      links: { github: null, linkedin: null, portfolio: null },
      projects: [],
    },
  });
  mockDb.session.start(user.id);
  return user;
}

export async function logout(): Promise<void> {
  await mockDb.delay(200);
  mockDb.session.end();
}

export async function getMe(): Promise<User | null> {
  await mockDb.delay(200);
  const userId = mockDb.session.getUserId();
  return userId ? mockDb.findUserById(userId) : null;
}
