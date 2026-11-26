import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../features/auth';
import { mockDb } from '../test/mock-db';
import { LoginPage } from './LoginPage';

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderLogin() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </AuthProvider>,
  );
  return userEvent.setup();
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
  });

  it('có link Quên mật khẩu? tới /forgot-password', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: 'Quên mật khẩu?' })).toHaveAttribute('href', '/forgot-password');
  });

  it('nút SSO không làm gì khi bấm', async () => {
    const user = renderLogin();
    const sso = screen.getByRole('button', { name: /Đăng nhập bằng Email Sinh viên trường/ });
    await user.click(sso);
    expect(sso).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ô Ghi nhớ đăng nhập không đổi khi bấm', async () => {
    const user = renderLogin();
    const remember = screen.getByRole('checkbox', { name: 'Ghi nhớ đăng nhập trên thiết bị này' });
    await user.click(remember);
    expect(remember).not.toBeChecked();
  });
});
