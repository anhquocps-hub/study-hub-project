import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../features/auth';
import { mockDb } from '../../test/mock-db';
import { AdminLayout } from './AdminLayout';

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
    mockDb.session.start('u-admin');
  });

  it('"Về giao diện sinh viên" dẫn về bảng tin', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin/users']}>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="/admin/users" element={<p>Nội dung</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(await screen.findByRole('link', { name: /Về giao diện sinh viên/ })).toHaveAttribute('href', '/');
  });
});
