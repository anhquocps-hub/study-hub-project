import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { OtpInput } from '../components/OtpInput';

function Harness() {
  const [value, setValue] = useState('');
  return (
    <>
      <OtpInput value={value} onChange={setValue} />
      <output data-testid="value">{value}</output>
    </>
  );
}

function setup() {
  render(<Harness />);
  return userEvent.setup();
}

const digit = (i: number) => screen.getByRole('textbox', { name: `Chữ số thứ ${i}` });

describe('OtpInput', () => {
  it('có 6 ô trong nhóm Mã OTP', () => {
    setup();
    expect(screen.getByRole('group', { name: 'Mã OTP' })).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  it('gõ số tự nhảy sang ô kế', async () => {
    const user = setup();
    await user.click(digit(1));
    await user.keyboard('482');
    expect(screen.getByTestId('value')).toHaveTextContent('482');
    expect(digit(4)).toHaveFocus();
  });

  it('Backspace ở ô trống lùi về ô trước và xóa', async () => {
    const user = setup();
    await user.click(digit(1));
    await user.keyboard('48');
    await user.keyboard('{Backspace}');
    expect(screen.getByTestId('value')).toHaveTextContent(/^4$/);
    expect(digit(2)).toHaveFocus();
  });

  it('dán chuỗi có ký tự lạ chỉ lấy tối đa 6 chữ số', () => {
    setup();
    fireEvent.paste(digit(3), { clipboardData: { getData: () => '4 8-2a9 1 7 5' } });
    expect(screen.getByTestId('value')).toHaveTextContent(/^482917$/);
  });

  it('gõ chữ cái bị bỏ qua', async () => {
    const user = setup();
    await user.click(digit(1));
    await user.keyboard('a');
    expect(screen.getByTestId('value')).toBeEmptyDOMElement();
    expect(digit(1)).toHaveFocus();
  });
});
