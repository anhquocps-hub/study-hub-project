import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UserStatusBadge } from '../components/UserStatusBadge';
import { EMPTY_EXTRAS, type AdminUser } from '../model/admin-user-schemas';

const BASE: AdminUser = {
  id: 'u1',
  email: 'a@b.vn',
  fullName: 'A',
  studentId: null,
  role: 'USER',
  status: 'ACTIVE',
  profileCompleted: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  university: null,
  ...EMPTY_EXTRAS,
};

describe('UserStatusBadge', () => {
  it('tài khoản BANNED luôn hiện Đã khóa dù có nhãn kiểm duyệt khác', () => {
    render(
      <UserStatusBadge
        user={{ ...BASE, status: 'BANNED', moderation: { kind: 'VERIFIED', label: 'Xác thực Giảng viên', detail: null } }}
      />,
    );
    expect(screen.getByText('Đã khóa')).toBeInTheDocument();
    expect(screen.queryByText('Xác thực Giảng viên')).not.toBeInTheDocument();
  });

  it('ACTIVE không có nhãn kiểm duyệt thì hiện Đang hoạt động', () => {
    render(<UserStatusBadge user={BASE} />);
    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();
  });

  it('ACTIVE có nhãn tạm khóa thì hiện nhãn và chi tiết', () => {
    render(
      <UserStatusBadge
        user={{ ...BASE, moderation: { kind: 'TEMP_BAN', label: 'Tạm khóa 7 ngày', detail: 'Còn lại 4 ngày 12h' } }}
      />,
    );
    expect(screen.getByText('Tạm khóa 7 ngày')).toBeInTheDocument();
    expect(screen.getByText('Còn lại 4 ngày 12h')).toBeInTheDocument();
  });
});
