export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

const LABELS: Record<PasswordStrengthScore, string> = {
  0: 'Chưa nhập',
  1: 'Yếu',
  2: 'Trung bình',
  3: 'Khá',
  4: 'Mạnh',
};

/**
 * Chấm độ mạnh mật khẩu theo 4 tiêu chí trong Figma: đủ 8 ký tự, có chữ in hoa, có chữ số, có ký tự đặc biệt.
 * Chỉ để gợi ý; quy tắc bắt buộc nằm ở passwordField trong auth-schemas.ts.
 */
export function getPasswordStrength(password: string): { score: PasswordStrengthScore; label: string } {
  if (password === '') return { score: 0, label: LABELS[0] };
  const passed = [
    password.length >= 8,
    /\p{Lu}/u.test(password),
    /\d/.test(password),
    /[^\p{L}\d\s]/u.test(password),
  ].filter(Boolean).length;
  const score = Math.max(1, passed) as PasswordStrengthScore;
  return { score, label: LABELS[score] };
}
