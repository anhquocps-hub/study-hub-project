import { z } from 'zod';

/** Người dùng đang đăng nhập, do BE trả về từ /auth/login, /auth/register, /auth/me. */
export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  role: z.enum(['USER', 'ADMIN']),
  /** BE trả true khi hồ sơ đã có trường và ngành; false thì FE đưa người dùng tới trang hoàn thiện hồ sơ. */
  profileCompleted: z.boolean(),
});
export type User = z.infer<typeof userSchema>;

// zod 4: dùng z.email() vì .email() trên chuỗi đã bị đánh dấu deprecated.
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Vui lòng nhập email.')
  .pipe(z.email('Email không hợp lệ.'));

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
});
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Quy tắc mật khẩu bắt buộc: 8–72 ký tự, có chữ và số (72 là giới hạn của bcrypt).
 * Chữ in hoa và ký tự đặc biệt không bắt buộc; thanh độ mạnh ở form đăng ký khuyến khích thêm.
 */
export const passwordField = z
  .string()
  .min(8, 'Mật khẩu cần ít nhất 8 ký tự.')
  .max(72, 'Mật khẩu tối đa 72 ký tự.')
  .regex(/\p{L}/u, 'Mật khẩu cần có chữ cái.')
  .regex(/\d/, 'Mật khẩu cần có chữ số.');

const registerFields = z.object({
  fullName: z.string().trim().min(2, 'Họ tên cần ít nhất 2 ký tự.').max(50, 'Họ tên tối đa 50 ký tự.'),
  email: emailField,
  universityId: z.string().min(1, 'Vui lòng chọn trường.'),
  /** MSSV không bắt buộc; để trống thì gửi null. */
  studentId: z
    .string()
    .trim()
    .max(20, 'MSSV tối đa 20 ký tự.')
    .regex(/^[A-Za-z0-9]*$/, 'MSSV chỉ gồm chữ không dấu và số.'),
  password: passwordField,
  confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu.'),
  acceptTerms: z.boolean().refine((accepted) => accepted, 'Bạn cần đồng ý với điều khoản để tạo tài khoản.'),
});

const passwordPair = registerFields.pick({ password: true, confirmPassword: true });

export const registerSchema = registerFields.refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu nhập lại không khớp.',
  path: ['confirmPassword'],
  // Vẫn kiểm tra khớp mật khẩu khi các ô khác (ví dụ email) đang lỗi, miễn là hai ô mật khẩu tự chúng hợp lệ.
  when: (payload) => passwordPair.safeParse(payload.value).success,
});
export type RegisterInput = z.infer<typeof registerSchema>;
