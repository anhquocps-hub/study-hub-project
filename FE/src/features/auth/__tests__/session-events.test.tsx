import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '../../../pages/LoginPage';
import { request } from '../../../services/http-client';
import { mockDb } from '../../../test/mock-db';
import { AuthProvider, GuestOnly, RequireAuth } from '..';

function renderApp() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<p>Trang bảng tin</p>} />
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

  it('hết phiên thì về trang đăng nhập và báo phiên đã hết hạn', async () => {
    renderApp();
    await screen.findByText('Trang bảng tin');
    stubFetch(401, 'Vui lòng đăng nhập để tiếp tục.');
    await request('/users').catch(() => undefined);

    expect(await screen.findByRole('heading', { name: 'Đăng nhập tài khoản' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
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
