import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppLayout } from '../../../components/layout/AppLayout';
import { mockDb } from '../../../test/mock-db';
import { AuthProvider, RequireAdmin, RequireAuth } from '..';

function renderAt(path: string) {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<p>Trang đăng nhập</p>} />
          <Route element={<RequireAuth />}>
            <Route element={<RequireAdmin />}>
              <Route path="/admin/users" element={<p>Nội dung quản trị</p>} />
            </Route>
            <Route element={<AppLayout />}>
              <Route path="/" element={<p>Trang bảng tin</p>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('RequireAdmin', () => {
  beforeEach(() => {
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
  });

  it('người dùng thường thấy trang 403 có đường về bảng tin', async () => {
    mockDb.session.start('u-demo');
    renderAt('/admin/users');
    expect(await screen.findByRole('heading', { name: 'Bạn không có quyền truy cập trang này' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về bảng tin' })).toHaveAttribute('href', '/');
    expect(screen.queryByText('Nội dung quản trị')).not.toBeInTheDocument();
  });

  it('admin vào được trang quản trị', async () => {
    mockDb.session.start('u-admin');
    renderAt('/admin/users');
    expect(await screen.findByText('Nội dung quản trị')).toBeInTheDocument();
  });

  it('khách bị đưa về trang đăng nhập', async () => {
    renderAt('/admin/users');
    expect(await screen.findByText('Trang đăng nhập')).toBeInTheDocument();
  });

  it('admin thấy lối vào Quản trị hệ thống trên thanh điều hướng', async () => {
    mockDb.session.start('u-admin');
    renderAt('/');
    expect(await screen.findByRole('link', { name: /Quản trị hệ thống/ })).toHaveAttribute('href', '/admin/users');
  });

  it('người dùng thường không thấy lối vào Quản trị hệ thống', async () => {
    mockDb.session.start('u-demo');
    renderAt('/');
    await screen.findByText('Trang bảng tin');
    expect(screen.queryByRole('link', { name: /Quản trị hệ thống/ })).not.toBeInTheDocument();
  });
});
