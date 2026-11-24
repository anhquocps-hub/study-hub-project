/**
 * Kiểu dữ liệu của trang Admin quản lý người dùng.
 *
 * "Trường mở rộng" là dữ liệu có trong thiết kế nhưng BE chưa trả về. Mock điền đủ; API thật để null và giao diện
 * hiện "—" hoặc "Chưa có dữ liệu". Khi BE bổ sung trường nào chỉ cần sửa schema + hàm gọi API.
 */

export type ModerationKind = 'WARNING' | 'TEMP_BAN' | 'FLAGGED' | 'VERIFIED' | 'ACTIVE_POSITIVE';

export interface AdminUserExtras {
  avatarUrl: string | null;
  /** Tên tài khoản phụ, ví dụ "user_4912". */
  username: string | null;
  /** Khóa học, ví dụ "K21". */
  cohort: string | null;
  faculty: string | null;
  className: string | null;
  /** Chức danh hiển thị thay cho MSSV, ví dụ "Giảng viên". */
  title: string | null;
  /** Dòng phụ dưới cột trường/khoa, ví dụ "GPA: 3.65 • Top Guild Lead". */
  highlight: string | null;
  skills: string[] | null;
  /** Độ tin cậy 0–100. */
  trustScore: number | null;
  /** Ví dụ "0 vi phạm", "5 báo cáo". */
  violationSummary: string | null;
  moderation: { kind: ModerationKind; label: string; detail: string | null } | null;
}
