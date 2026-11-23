import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

const baseProps = {
  title: 'Xóa bài viết?',
  message: 'Thao tác không thể hoàn tác.',
  confirmLabel: 'Xóa bài viết',
};

describe('ConfirmDialog', () => {
  it('hiển thị tiêu đề, nội dung và nút ghi rõ hành động', () => {
    render(<ConfirmDialog {...baseProps} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    const dialog = screen.getByRole('alertdialog', { name: 'Xóa bài viết?' });
    expect(dialog).toHaveTextContent('Thao tác không thể hoàn tác.');
    expect(screen.getByRole('button', { name: 'Xóa bài viết' })).toBeInTheDocument();
  });

  it('focus mặc định vào nút Hủy để tránh xóa nhầm', () => {
    render(<ConfirmDialog {...baseProps} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Hủy' })).toHaveFocus();
  });

  it('gọi onConfirm / onCancel theo nút bấm', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Xóa bài viết' }));
    await userEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('Escape đóng hộp thoại, trừ khi đang xử lý', () => {
    const onCancel = vi.fn();
    const { rerender } = render(<ConfirmDialog {...baseProps} onConfirm={vi.fn()} onCancel={onCancel} />);
    fireEvent(screen.getByRole('alertdialog'), new Event('cancel', { cancelable: true }));
    expect(onCancel).toHaveBeenCalledOnce();

    rerender(<ConfirmDialog {...baseProps} isBusy onConfirm={vi.fn()} onCancel={onCancel} />);
    fireEvent(screen.getByRole('alertdialog'), new Event('cancel', { cancelable: true }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('đang xử lý thì khóa cả hai nút', () => {
    render(<ConfirmDialog {...baseProps} isBusy onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Xóa bài viết/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeDisabled();
  });

  it('hiện lỗi khi thao tác thất bại', () => {
    render(<ConfirmDialog {...baseProps} error="Bạn không có quyền." onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Bạn không có quyền.');
  });

  it('đóng thì trả focus về nút đã mở nó', async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Mở
          </button>
          {open && <ConfirmDialog {...baseProps} onConfirm={vi.fn()} onCancel={() => setOpen(false)} />}
        </>
      );
    }
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Mở' });
    await userEvent.click(opener);
    await userEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(opener).toHaveFocus();
  });
});

describe('ConfirmDialog — focus khi phần tử mở đã bị xóa', () => {
  it('chuyển focus về vùng data-focus-fallback gần nhất', async () => {
    function Harness() {
      const [items, setItems] = useState(['a', 'b']);
      const [target, setTarget] = useState<string | null>(null);
      return (
        <section tabIndex={-1} data-focus-fallback aria-label="Danh sách">
          {items.map((item) => (
            <button key={item} type="button" onClick={() => setTarget(item)}>
              Xóa {item}
            </button>
          ))}
          {target && (
            <ConfirmDialog
              {...baseProps}
              onConfirm={() => {
                setItems((list) => list.filter((item) => item !== target));
                setTarget(null);
              }}
              onCancel={() => setTarget(null)}
            />
          )}
        </section>
      );
    }
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Xóa a' }));
    await userEvent.click(screen.getByRole('button', { name: 'Xóa bài viết' }));
    expect(screen.queryByRole('button', { name: 'Xóa a' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Danh sách' })).toHaveFocus();
  });

  it('đang xử lý thì focus nằm ở hộp thoại', () => {
    render(<ConfirmDialog {...baseProps} isBusy onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('alertdialog')).toHaveFocus();
  });
});
