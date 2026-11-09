import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../features/auth';
import { mockDb } from '../test/mock-db';
import { FeedPage } from './FeedPage';

function renderFeed() {
  render(
    <AuthProvider>
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>
    </AuthProvider>,
  );
  return userEvent.setup();
}

describe('FeedPage', () => {
  beforeEach(() => {
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
    mockDb.session.start('u-demo');
  });

  it('"Xem thêm bài viết" tải trang tiếp theo đến khi hết', async () => {
    const user = renderFeed();
    expect(await screen.findAllByRole('article')).toHaveLength(5);

    await user.click(screen.getByRole('button', { name: 'Xem thêm bài viết' }));

    expect(await screen.findByText('Bạn đã xem hết bài viết.')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(screen.queryByRole('button', { name: 'Xem thêm bài viết' })).not.toBeInTheDocument();
  });

  it('bấm nút bình luận mở phần bình luận ngay trong thẻ bài', async () => {
    const user = renderFeed();
    const article = await screen.findByRole('article', { name: /Docker Compose báo lỗi/ });
    const toggle = within(article).getByRole('button', { name: /Bình luận \(1\)/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(await within(article).findByText(/Đổi port bên trái/)).toBeInTheDocument();
  });

  it('thời gian đăng dẫn tới trang chi tiết bài viết', async () => {
    renderFeed();
    const article = await screen.findByRole('article', { name: /Docker Compose báo lỗi/ });
    expect(within(article).getByRole('link', { name: /giờ trước/ })).toHaveAttribute('href', '/posts/post-hoi-docker');
  });
});
