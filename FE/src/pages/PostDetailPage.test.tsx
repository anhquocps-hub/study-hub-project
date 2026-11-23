import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../features/auth';
import { mockDb } from '../test/mock-db';
import { PostDetailPage } from './PostDetailPage';

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderAt(path: string) {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<p>Trang bảng tin</p>} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </AuthProvider>,
  );
  return { user: userEvent.setup() };
}

describe('PostDetailPage', () => {
  beforeEach(() => {
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
    mockDb.session.start('u-demo');
  });

  it('hiện bài viết và mở sẵn phần bình luận', async () => {
    renderAt('/posts/post-on-thi-csdl');
    expect(await screen.findByRole('heading', { name: /ôn thi Giữa kỳ môn Cơ sở dữ liệu/ })).toBeInTheDocument();
    expect(await screen.findByText(/Cho mình 1 slot với/)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Viết bình luận' })).toBeInTheDocument();
  });

  it('bình luận mới làm tăng số bình luận trên bài', async () => {
    const { user } = renderAt('/posts/post-hoi-docker');
    await screen.findByText(/Đổi port bên trái/);
    const article = screen.getByRole('article', { name: /port is already allocated/ });
    expect(within(article).getByRole('button', { name: /Bình luận \(1\)/ })).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: 'Viết bình luận' }), 'Cảm ơn bạn, mình làm được rồi');
    await user.click(screen.getByRole('button', { name: 'Gửi bình luận' }));

    expect(await within(article).findByRole('button', { name: /Bình luận \(2\)/ })).toBeInTheDocument();
  });

  it('bài không tồn tại thì báo 404 và có đường về bảng tin', async () => {
    renderAt('/posts/khong-ton-tai');
    expect(await screen.findByRole('heading', { name: 'Không tìm thấy bài viết' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về bảng tin' })).toHaveAttribute('href', '/');
  });

  it('xóa bài của mình thì quay về bảng tin', async () => {
    const created = await (await import('../features/posts/api/posts-api.mock')).createPost({
      type: 'GENERAL',
      content: 'Bài viết của demo để thử xóa',
      tags: [],
      subject: '',
      classCode: '',
      semester: null,
      lecturer: null,
    });
    const { user } = renderAt(`/posts/${created.id}`);
    await screen.findByText('Bài viết của demo để thử xóa');

    await user.click(screen.getByRole('button', { name: 'Xóa' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa bài viết' }));

    expect(await screen.findByText('Trang bảng tin')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
  });
});
