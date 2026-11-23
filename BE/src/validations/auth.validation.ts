import { z } from 'zod';

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Vui lòng nhập email.')
  .pipe(z.string().email('Email không đúng định dạng.'));

const passwordField = z
  .string()
  .min(8, 'Mật khẩu cần ít nhất 8 ký tự.')
  .max(72, 'Mật khẩu tối đa 72 ký tự.');

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Họ tên cần ít nhất 2 ký tự.').max(50, 'Họ tên tối đa 50 ký tự.'),
  email: emailField,
  password: passwordField,
  universityId: z.string().min(1, 'Vui lòng chọn trường đại học.'),
  studentId: z.string().trim().nullable().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, 'Bạn cần đồng ý với điều khoản để tạo tài khoản.'),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Mã xác nhận không được để trống.'),
  newPassword: passwordField,
});
