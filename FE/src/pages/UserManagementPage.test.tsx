import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../features/auth';
import { mockDb } from '../test/mock-db';
import { UserManagementPage } from './UserManagementPage';

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

function renderAt(path = '/admin/users') {
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

const TOTAL = () => mockDb.listAccounts().length;
const bodyRows = () => within(screen.getByRole('table', { name: 'Danh sách người dùng' })).getAllByRole('row').slice(1);
const rowOf = (name: RegExp) => screen.getByRole('row', { name });
/** Ô tìm kiếm chờ 300ms sau phím cuối rồi mới lọc: cho thêm thời gian khi máy chạy test đang bận. */
const AFTER_DEBOUNCE = { timeout: 3000 };

describe('UserManagementPage', () => {
  beforeEach(() => {
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
    mockDb.session.start('u-admin');
  });

  it('hiện 10 người dùng đầu tiên và tổng số', async () => {
    renderAt();
    expect(await screen.findByText(`Hiển thị 1 - 10 trong tổng số ${TOTAL()} người dùng`)).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(10);
  });

  it('thống kê đầu trang lấy từ dữ liệu mock', async () => {
    renderAt();
    expect(await screen.findByText('3,482')).toBeInTheDocument();
    expect(screen.getByText('TỔNG NGƯỜI DÙNG')).toBeInTheDocument();
  });

  it('tìm theo MSSV lọc bảng và về trang 1', async () => {
    const user = renderAt();
    await screen.findByText(/Hiển thị 1 - 10/);
    await user.click(screen.getByRole('button', { name: 'Trang 2' }));
    expect(await screen.findByText(/Hiển thị 11 - 20/)).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'Tìm kiếm người dùng' }), '21110782');
    expect(await screen.findByRole('row', { name: /Minh Tuấn/ }, AFTER_DEBOUNCE)).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(1);
    expect(screen.getByTestId('location')).toHaveTextContent('search=21110782');
    expect(screen.getByTestId('location')).not.toHaveTextContent('page=2');
  });

  it('lọc Đã khóa chỉ hiện tài khoản bị khóa', async () => {
    const user = renderAt();
    await screen.findByText(/Hiển thị 1 - 10/);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Lọc theo trạng thái' }), 'BANNED');
    await screen.findByText(/trong tổng số \d+ người dùng/);
    for (const row of bodyRows()) expect(within(row).getByText('Đã khóa')).toBeInTheDocument();
  });

  it('mở trang với bộ lọc trên URL thì giữ bộ lọc', async () => {
    renderAt('/admin/users?status=BANNED');
    await screen.findByText(/trong tổng số \d+ người dùng/);
    expect(screen.getByRole('combobox', { name: 'Lọc theo trạng thái' })).toHaveValue('BANNED');
    for (const row of bodyRows()) expect(within(row).getByText('Đã khóa')).toBeInTheDocument();
  });

  it('đổi số hàng mỗi trang', async () => {
    const user = renderAt();
    await screen.findByText(/Hiển thị 1 - 10/);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Hàng trên trang' }), '20');
    expect(await screen.findByText(/Hiển thị 1 - 20/)).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(20);
  });

  it('khóa tài khoản qua hộp thoại xác nhận cập nhật trạng thái hàng', async () => {
    const user = renderAt('/admin/users?search=21110782');
    await screen.findByRole('row', { name: /Minh Tuấn/ });
    await user.click(screen.getByRole('button', { name: 'Khóa tài khoản Minh Tuấn' }));
    const dialog = screen.getByRole('alertdialog');
    expect(within(dialog).getByText(/Minh Tuấn/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Khóa tài khoản' }));

    expect(await within(rowOf(/Minh Tuấn/)).findByText('Đã khóa')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mở khóa tài khoản Minh Tuấn' })).toBeInTheDocument();
  });

  it('cấp quyền Quản trị viên từ menu Thêm thao tác', async () => {
    const user = renderAt('/admin/users?search=21110782');
    await screen.findByRole('row', { name: /Minh Tuấn/ });
    await user.click(screen.getByRole('button', { name: 'Thêm thao tác cho Minh Tuấn' }));
    await user.click(screen.getByRole('menuitem', { name: 'Cấp quyền Quản trị viên' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cấp quyền' }));

    expect(await within(rowOf(/Minh Tuấn/)).findByText('Quản trị viên')).toBeInTheDocument();
    expect(mockDb.getAccount('u-minh-tuan')?.role).toBe('ADMIN');
  });

  it('hàng của chính admin không khóa và không đổi quyền được', async () => {
    renderAt('/admin/users?search=admin@unispace.vn');
    await screen.findByRole('row', { name: /Quản trị viên UniSpace/ });
    expect(screen.getByRole('button', { name: 'Khóa tài khoản Quản trị viên UniSpace' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Thêm thao tác cho Quản trị viên UniSpace' })).toBeDisabled();
  });

  it('không tìm thấy ai thì báo rỗng', async () => {
    renderAt('/admin/users?search=khong-co-ai-ten-nay');
    expect(await screen.findByText('Không tìm thấy người dùng phù hợp')).toBeInTheDocument();
  });

  it('các nút chưa hỗ trợ không làm gì khi bấm', async () => {
    const user = renderAt();
    await screen.findByText(/Hiển thị 1 - 10/);
    const before = screen.getByTestId('location').textContent;

    for (const name of ['Thông báo hệ thống', 'Xuất CSV', 'Thêm người dùng']) {
      const button = screen.getByRole('button', { name });
      await user.click(button);
      expect(button).toHaveAttribute('aria-disabled', 'true');
    }

    await user.click(within(bodyRows()[0]).getByRole('checkbox'));
    expect(screen.getByText('Đã chọn: 1 tài khoản')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Khóa tạm thời' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('location').textContent).toBe(before);
  });

  it('chọn tất cả trên trang rồi bỏ chọn khi sang trang khác', async () => {
    const user = renderAt();
    await screen.findByText(/Hiển thị 1 - 10/);
    await user.click(screen.getByRole('checkbox', { name: 'Chọn tất cả trên trang' }));
    expect(screen.getByText('Đã chọn: 10 tài khoản')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Trang 2' }));
    await screen.findByText(/Hiển thị 11 - 20/);
    expect(screen.queryByText(/Đã chọn:/)).not.toBeInTheDocument();
  });
});
