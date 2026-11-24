import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserManagementPage } from '../../../pages/UserManagementPage';
import { mockDb } from '../../../test/mock-db';
import { AuthProvider } from '../../auth';
import * as mockApi from '../api/admin-users-api.mock';
import { EMPTY_EXTRAS } from '../model/admin-user-schemas';

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

function renderAt(path: string) {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/admin/users" element={<UserManagementPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </AuthProvider>,
  );
  return userEvent.setup();
}

describe('UserDrawer', () => {
  beforeEach(() => {
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
    mockDb.session.start('u-admin');
  });

  it('bấm Xem chi tiết mở ngăn với thông tin người dùng', async () => {
    const user = renderAt('/admin/users?search=21110782');
    await user.click(await screen.findByRole('button', { name: 'Xem chi tiết Minh Tuấn' }));

    const drawer = await screen.findByRole('dialog', { name: 'Hồ sơ Quản trị Chi tiết' });
    expect(await within(drawer).findByRole('heading', { name: 'Minh Tuấn' })).toBeInTheDocument();
    expect(within(drawer).getByText('ĐH Sư Phạm Kỹ Thuật (HCMUTE)')).toBeInTheDocument();
    expect(within(drawer).getByText('Đồ Án Tốt Nghiệp CNTT 2024')).toBeInTheDocument();
    expect(within(drawer).getByText('Admin Session: admin@unispace.vn')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('user=u-minh-tuan');
  });

  it('nhấn Esc đóng ngăn và bỏ user khỏi URL', async () => {
    const user = renderAt('/admin/users?search=21110782&user=u-minh-tuan');
    await screen.findByRole('dialog', { name: 'Hồ sơ Quản trị Chi tiết' });
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).not.toHaveTextContent('user=');
    expect(screen.getByTestId('location')).toHaveTextContent('search=21110782');
  });

  it('nút Đóng ngăn đóng ngăn', async () => {
    const user = renderAt('/admin/users?user=u-minh-tuan');
    const drawer = await screen.findByRole('dialog', { name: 'Hồ sơ Quản trị Chi tiết' });
    await user.click(within(drawer).getByRole('button', { name: 'Đóng ngăn' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('người dùng không tồn tại thì báo không tìm thấy', async () => {
    renderAt('/admin/users?user=khong-ton-tai');
    const drawer = await screen.findByRole('dialog', { name: 'Hồ sơ Quản trị Chi tiết' });
    expect(await within(drawer).findByText('Không tìm thấy người dùng này.')).toBeInTheDocument();
  });

  it('khối không có dữ liệu thì hiện Chưa có dữ liệu', async () => {
    vi.spyOn(mockApi, 'getUserById').mockResolvedValue({
      id: 'u-x',
      email: 'x@unispace.vn',
      fullName: 'Người Không Dữ Liệu',
      studentId: null,
      role: 'USER',
      status: 'ACTIVE',
      profileCompleted: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      university: null,
      ...EMPTY_EXTRAS,
      stats: null,
      verification: null,
      spaces: null,
      recentPosts: null,
    });
    renderAt('/admin/users?user=u-x');
    const drawer = await screen.findByRole('dialog', { name: 'Hồ sơ Quản trị Chi tiết' });
    await within(drawer).findByRole('heading', { name: 'Người Không Dữ Liệu' });
    expect(within(drawer).getAllByText('Chưa có dữ liệu').length).toBeGreaterThanOrEqual(2);
  });

  it('các tác vụ can thiệp chưa hỗ trợ không gọi API', async () => {
    const updateStatus = vi.spyOn(mockApi, 'updateUserStatus');
    const user = renderAt('/admin/users?user=u-minh-tuan');
    const drawer = await screen.findByRole('dialog', { name: 'Hồ sơ Quản trị Chi tiết' });
    await within(drawer).findByRole('heading', { name: 'Minh Tuấn' });

    for (const name of ['Reset Mật khẩu', 'Gửi Inbox Admin', 'Tặng 1 Gậy Cảnh Cáo', 'Tạm Khóa 7 Ngày']) {
      const button = within(drawer).getByRole('button', { name });
      await user.click(button);
      expect(button).toHaveAttribute('aria-disabled', 'true');
    }
    expect(updateStatus).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
