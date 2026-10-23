import { ApiError, request } from '../../../services/http-client';
import { userSchema, type LoginInput, type RegisterInput, type User } from '../model/auth-schemas';

export async function login(input: LoginInput): Promise<User> {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: input.email, password: input.password }),
  });
  return userSchema.parse(data);
}

export async function register(input: RegisterInput): Promise<User> {
  // Không gửi confirmPassword: ô đó chỉ để người dùng tự kiểm tra lại.
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: input.fullName,
      email: input.email,
      password: input.password,
      universityId: input.universityId,
      studentId: input.studentId === '' ? null : input.studentId,
      acceptTerms: input.acceptTerms,
    }),
  });
  return userSchema.parse(data);
}

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' });
}

/** Định danh bằng cookie phiên hiện tại; trả null nếu chưa đăng nhập. */
export async function getMe(): Promise<User | null> {
  try {
    return userSchema.parse(await request('/auth/me'));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
