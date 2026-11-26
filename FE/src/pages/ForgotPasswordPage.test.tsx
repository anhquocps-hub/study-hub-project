import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, GuestOnly } from '../features/auth';
import * as mockAuthApi from '../features/auth/api/auth-api.mock';
import { mockDb } from '../test/mock-db';
import { ForgotPasswordPage } from './ForgotPasswordPage';

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderPage() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/forgot-password']}>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/login" element={<p>Trang đăng nhập</p>} />
          </Route>
          <Route path="/" element={<p>Trang bảng tin</p>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </AuthProvider>,
  );
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
}

async function goToOtpStep(user: ReturnType<typeof userEvent.setup>, email = 'demo@unispace.vn') {
  await user.type(await screen.findByRole('textbox', { name: /Địa chỉ email của bạn/ }), email);
  await user.click(screen.getByRole('button', { name: 'Gửi mã xác thực OTP' }));
  await screen.findByRole('heading', { name: 'Xác thực mã bảo mật OTP' });
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('email sai định dạng thì không sang bước 2', async () => {
    const user = renderPage();
    await user.type(await screen.findByRole('textbox', { name: /Địa chỉ email của bạn/ }), 'khong-phai-email');
    await user.click(screen.getByRole('button', { name: 'Gửi mã xác thực OTP' }));
    expect(await screen.findByText('Email không hợp lệ.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Xác thực mã bảo mật OTP' })).not.toBeInTheDocument();
  });

  it('gửi email hợp lệ thì sang bước nhập OTP và hiện email đó', async () => {
    const user = renderPage();
    await goToOtpStep(user, 'ai-do@student.hcmute.edu.vn');
    expect(screen.getByText('ai-do@student.hcmute.edu.vn')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Mã OTP' })).toBeInTheDocument();
  });

  it('nút Gửi lại bị khóa 60 giây rồi mới bấm được', async () => {
    const user = renderPage();
    await goToOtpStep(user);
    expect(screen.getByRole('button', { name: 'Gửi lại OTP (60s)' })).toBeDisabled();
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByRole('button', { name: 'Gửi lại OTP' })).toBeEnabled();
  });

  it('đồng hồ hết 5 phút thì báo mã hết hạn', async () => {
    const user = renderPage();
    await goToOtpStep(user);
    expect(screen.getByText('05:00')).toBeInTheDocument();
    expect(screen.getByText(/Mã sẽ hết hiệu lực trong:/)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(300_000);
    });
    expect(screen.getByText('Mã đã hết hạn, vui lòng gửi lại mã.')).toBeInTheDocument();
  });

  it('Xác nhận & Tiếp tục không làm gì', async () => {
    const request = vi.spyOn(mockAuthApi, 'requestPasswordReset');
    const user = renderPage();
    await goToOtpStep(user);
    await user.click(screen.getByRole('textbox', { name: 'Chữ số thứ 1' }));
    await user.keyboard('482917');
    const confirm = screen.getByRole('button', { name: /Xác nhận & Tiếp tục/ });
    await user.click(confirm);
    expect(confirm).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('heading', { name: 'Xác thực mã bảo mật OTP' })).toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('thay đổi email quay về bước 1 và giữ email cũ', async () => {
    const user = renderPage();
    await goToOtpStep(user, 'cu@unispace.vn');
    await user.click(screen.getByRole('button', { name: '(thay đổi email)' }));
    expect(screen.getByRole('textbox', { name: /Địa chỉ email của bạn/ })).toHaveValue('cu@unispace.vn');
  });

  it('kênh SĐT / Zalo Edu không làm gì khi bấm', async () => {
    const user = renderPage();
    const sms = await screen.findByRole('button', { name: 'SĐT / Zalo Edu' });
    await user.click(sms);
    expect(sms).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Email trường / Cá nhân' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('đã đăng nhập thì /forgot-password chuyển đi', async () => {
    mockDb.session.start('u-demo');
    renderPage();
    expect(await screen.findByText('Trang bảng tin')).toBeInTheDocument();
  });
});
