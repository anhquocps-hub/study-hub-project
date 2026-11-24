import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { INERT_PROPS } from './inert';

describe('INERT_PROPS', () => {
  it('nút gắn INERT_PROPS không có xử lý click và báo aria-disabled', async () => {
    render(<button {...INERT_PROPS}>Xuất CSV</button>);
    const button = screen.getByRole('button', { name: 'Xuất CSV' });
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('title', 'Sắp có');
  });
});
