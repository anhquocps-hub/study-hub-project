import { describe, expect, it } from 'vitest';
import { mockDb } from './mock-db';
import { MOCK_USER_EXTRAS } from './mock-directory';

describe('mockDb — danh bạ người dùng', () => {
  it('có tài khoản admin demo và đủ người dùng để phân trang', () => {
    const accounts = mockDb.listAccounts();
    const admin = accounts.find((account) => account.email === 'admin@unispace.vn');
    expect(admin?.role).toBe('ADMIN');
    expect(accounts.length).toBeGreaterThanOrEqual(40);
  });

  it('mọi tài khoản đều có trạng thái và ngày tạo', () => {
    for (const account of mockDb.listAccounts()) {
      expect(['ACTIVE', 'BANNED']).toContain(account.status);
      expect(Number.isNaN(Date.parse(account.createdAt))).toBe(false);
    }
  });

  it('khóa tài khoản thì đọc lại thấy BANNED', () => {
    mockDb.updateAccount('u-khac', { status: 'BANNED' });
    expect(mockDb.getAccount('u-khac')?.status).toBe('BANNED');
  });

  it('mọi tài khoản đều có dữ liệu mở rộng cho trang admin', () => {
    for (const account of mockDb.listAccounts()) {
      expect(MOCK_USER_EXTRAS[account.profile.userId]).toBeDefined();
    }
  });

  it('có đủ 5 người dùng như thiết kế', () => {
    const names = mockDb.listAccounts().map((account) => account.profile.fullName);
    for (const name of ['Minh Tuấn', 'Lê Văn T.', 'ThS. Nguyễn Văn A', 'Phạm H.', 'Trần Thị Nga']) {
      expect(names).toContain(name);
    }
  });
});
