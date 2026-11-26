import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '../../../pages/LoginPage';
import { request } from '../../../services/http-client';
import { mockDb } from '../../../test/mock-db';
import * as mockAuthApi from '../api/auth-api.mock';
import { AuthProvider, GuestOnly, RequireAuth, useAuth } from '..';

function RegisterHarness() {
  const { register } = useAuth();
  return (
    <button
      type="button"
      onClick={() =>
        void register({
          fullName: 'Tài Khoản Mới',
          email: 'moi@unispace.vn',
          universityId: 'hcmute',
          studentId: '',
          password: 'matkhau123',
          confirmPassword: 'matkhau123',
          acceptTerms: true,
        })
      }
    >
      Đăng ký thử
    </button>
  );
}

function LogoutHarness() {
  const { logout } = useAuth();
  return (
    <button type="button" onClick={() => void logout()}>
      Đăng xuất thử
    </button>
  );
}

function renderApp() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterHarness />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<p>Trang bảng tin</p>} />
            <Route path="/profile/edit" element={<LogoutHarness />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

const stubFetch = (status: number, message: string) =>
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ message }), { status })));

describe('AuthProvider — hết phiên / bị khóa giữa chừng', () => {
  beforeEach(() => {
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
    mockDb.session.start('u-demo');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('bị khóa giữa phiên thì về trang đăng nhập và thấy lý do', async () => {
    renderApp();
    await screen.findByText('Trang bảng tin');
    stubFetch(403, 'Tài khoản của bạn đã bị khóa do vi phạm tiêu chuẩn.');
    await request('/users').catch(() => undefined);

    expect(await screen.findByRole('heading', { name: 'Đăng nhập tài khoản' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Tài khoản của bạn đã bị khóa do vi phạm tiêu chuẩn.');
  });

  it('gửi form đăng nhập lần nữa thì bỏ thông báo cũ, chỉ còn lỗi mới', async () => {
    renderApp();
    await screen.findByText('Trang bảng tin');
    stubFetch(403, 'Tài khoản của bạn đã bị khóa do vi phạm tiêu chuẩn.');
    await request('/users').catch(() => undefined);
    await screen.findByRole('heading', { name: 'Đăng nhập tài khoản' });

    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: /Email/ }), 'demo@unispace.vn');
    await user.type(screen.getByLabelText(/Mật khẩu/), 'sai-mat-khau');
    await user.click(screen.getByRole('button', { name: 'Đăng nhập vào UniSpace' }));

    expect(await screen.findByText('Email hoặc mật khẩu không đúng.')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  it('đăng ký tài khoản khác rồi đăng xuất thì không còn thông báo cũ', async () => {
    renderApp();
    await screen.findByText('Trang bảng tin');
    stubFetch(403, 'Tài khoản của bạn đã bị khóa do vi phạm tiêu chuẩn.');
    await request('/users').catch(() => undefined);
    await screen.findByRole('heading', { name: 'Đăng nhập tài khoản' });

    const user = userEvent.setup();
    await user.click(screen.getByRole('link', { name: /Đăng ký ngay/ }));
    await user.click(await screen.findByRole('button', { name: 'Đăng ký thử' }));
    await user.click(await screen.findByRole('button', { name: 'Đăng xuất thử' }));

    expect(await screen.findByRole('heading', { name: 'Đăng nhập tài khoản' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('hết phiên thì về trang đăng nhập và báo phiên đã hết hạn', async () => {
    renderApp();
    await screen.findByText('Trang bảng tin');
    stubFetch(401, 'Vui lòng đăng nhập để tiếp tục.');
    await request('/users').catch(() => undefined);

    expect(await screen.findByRole('heading', { name: 'Đăng nhập tài khoản' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  });

  it('tải lại trang khi tài khoản đã bị khóa thì trang đăng nhập hiện lý do', async () => {
    // Khôi phục phiên đi qua http-client giống bản thật; BE trả 403 vì tài khoản bị khóa.
    vi.spyOn(mockAuthApi, 'getMe').mockImplementation(async () => {
      await request('/auth/me');
      return null;
    });
    stubFetch(403, 'Tài khoản của bạn đã bị khóa do vi phạm tiêu chuẩn.');
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Đăng nhập tài khoản' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Tài khoản của bạn đã bị khóa do vi phạm tiêu chuẩn.');
  });

  it('khách chưa đăng nhập gặp 401 thì không hiện thông báo hết phiên', async () => {
    mockDb.session.end();
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    await screen.findByRole('heading', { name: 'Đăng nhập tài khoản' });
    stubFetch(401, 'Vui lòng đăng nhập để tiếp tục.');
    await request('/auth/me').catch(() => undefined);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
