import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDb } from '../../../test/mock-db';
import { CommentSection } from '../components/CommentSection';

const POST_ID = 'post-expense-tracker'; // seed: c-1 (Bảo, 1 phản hồi), c-2 (Mai)
const BAO = { id: 'u-bao', fullName: 'Trần Quốc Bảo', avatarUrl: null };
const DEMO = { id: 'u-demo', fullName: 'Sinh viên Demo', avatarUrl: null };

function renderSection(viewer = DEMO, postId = POST_ID) {
  const onCountChange = vi.fn();
  mockDb.session.start(viewer.id);
  render(
    <MemoryRouter>
      <CommentSection postId={postId} currentUser={viewer} onCountChange={onCountChange} />
    </MemoryRouter>,
  );
  return { onCountChange, user: userEvent.setup() };
}

const findComment = async (text: string) => (await screen.findByText(text)).closest('article') as HTMLElement;

describe('CommentSection', () => {
  beforeEach(() => {
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
  });

  it('hiện trạng thái đang tải rồi danh sách bình luận', async () => {
    renderSection();
    expect(screen.getByRole('status', { name: 'Đang tải bình luận' })).toBeInTheDocument();
    expect(await screen.findByText(/có thể xem spec trước không/)).toBeInTheDocument();
    expect(screen.getByText(/Team còn nhận Designer/)).toBeInTheDocument();
  });

  it('bài chưa có bình luận thì hiện empty state', async () => {
    renderSection(DEMO, 'post-review-mon-hoc');
    expect(await screen.findByText(/Chưa có bình luận nào/)).toBeInTheDocument();
  });

  it('gửi bình luận mới: hiện đầu danh sách, xóa ô nhập và báo tăng số đếm', async () => {
    const { onCountChange, user } = renderSection();
    await screen.findByText(/có thể xem spec/);
    const input = screen.getByRole('textbox', { name: 'Viết bình luận' });

    await user.type(input, 'Mình muốn tham gia team!');
    await user.click(screen.getByRole('button', { name: 'Gửi bình luận' }));

    expect(await screen.findByText('Mình muốn tham gia team!')).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(onCountChange).toHaveBeenCalledWith(1);
  });

  it('không gửi bình luận rỗng', async () => {
    const { onCountChange, user } = renderSection();
    await screen.findByText(/có thể xem spec/);
    const send = screen.getByRole('button', { name: 'Gửi bình luận' });
    expect(send).toHaveAttribute('aria-disabled', 'true');
    await user.type(screen.getByRole('textbox', { name: 'Viết bình luận' }), '   ');
    await user.click(send);
    expect(send).toHaveAttribute('aria-disabled', 'true');
    expect(onCountChange).not.toHaveBeenCalled();
  });

  it('xem phản hồi của một bình luận', async () => {
    const { user } = renderSection();
    const comment = await findComment('Mình làm .NET được 1 năm rồi, có thể xem spec trước không bạn?');
    const toggle = within(comment).getByRole('button', { name: 'Xem 1 phản hồi' });
    await user.click(toggle);
    expect(await within(comment).findByText(/gửi link Notion/)).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveFocus();
    await user.click(toggle);
    expect(within(comment).queryByText(/gửi link Notion/)).not.toBeInTheDocument();
  });

  it('trả lời bình luận: phản hồi hiện trong luồng và báo tăng số đếm', async () => {
    const { onCountChange, user } = renderSection();
    const comment = await findComment('Team còn nhận Designer không ạ? Mình có portfolio Figma.');

    await user.click(within(comment).getByRole('button', { name: 'Trả lời' }));
    const replyBox = within(comment).getByRole('textbox', { name: 'Trả lời Phạm Ngọc Mai' });
    expect(replyBox).toHaveFocus();
    await user.type(replyBox, 'Còn nhé bạn!');
    await user.click(within(comment).getByRole('button', { name: 'Gửi phản hồi' }));

    expect(await within(comment).findByText('Còn nhé bạn!')).toBeInTheDocument();
    expect(onCountChange).toHaveBeenCalledWith(1);
  });

  it('chỉ bình luận của mình mới có nút Sửa/Xóa', async () => {
    renderSection(BAO);
    const mine = await findComment('Mình làm .NET được 1 năm rồi, có thể xem spec trước không bạn?');
    const others = await findComment('Team còn nhận Designer không ạ? Mình có portfolio Figma.');
    expect(within(mine).getByRole('button', { name: /^Sửa bình luận của/ })).toBeInTheDocument();
    expect(within(others).queryByRole('button', { name: /^Sửa bình luận/ })).not.toBeInTheDocument();
    expect(within(others).queryByRole('button', { name: /^Xóa bình luận/ })).not.toBeInTheDocument();
  });

  it('sửa bình luận của mình', async () => {
    const { user } = renderSection(BAO);
    const mine = await findComment('Mình làm .NET được 1 năm rồi, có thể xem spec trước không bạn?');

    await user.click(within(mine).getByRole('button', { name: /^Sửa bình luận của/ }));
    const editor = within(mine).getByRole('textbox', { name: 'Sửa bình luận' });
    await user.clear(editor);
    await user.type(editor, 'Mình làm .NET 2 năm rồi nhé');
    await user.click(within(mine).getByRole('button', { name: 'Lưu' }));

    expect(await screen.findByText('Mình làm .NET 2 năm rồi nhé')).toBeInTheDocument();
    expect(screen.getByText('(đã sửa)')).toBeInTheDocument();
    expect(within(mine).getByRole('button', { name: /^Sửa bình luận của/ })).toHaveFocus(); // focus trở lại nút Sửa
  });

  it('xóa bình luận qua hộp xác nhận: mất khỏi danh sách và trừ cả phản hồi', async () => {
    const { onCountChange, user } = renderSection(BAO);
    const mine = await findComment('Mình làm .NET được 1 năm rồi, có thể xem spec trước không bạn?');

    await user.click(within(mine).getByRole('button', { name: 'Xóa bình luận của Trần Quốc Bảo' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Xóa bình luận?' });
    await user.click(within(dialog).getByRole('button', { name: 'Xóa bình luận' }));

    await waitFor(() => expect(screen.queryByText(/có thể xem spec trước không/)).not.toBeInTheDocument());
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onCountChange).toHaveBeenCalledWith(-2);
    expect(screen.getByLabelText('Danh sách bình luận')).toHaveFocus(); // không rơi focus về <body>
  });

  it('báo lỗi tải và cho thử lại', async () => {
    renderSection(DEMO, 'khong-ton-tai');
    expect(await screen.findByText(/Không tải được bình luận/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });
});
