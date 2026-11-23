import { describe, expect, it } from 'vitest';
import { timeAgo } from './time-ago';

const NOW = new Date('2026-11-09T12:00:00Z').getTime();
const ago = (ms: number) => new Date(NOW - ms).toISOString();

describe('timeAgo', () => {
  it('dưới 1 phút là "Vừa xong"', () => {
    expect(timeAgo(ago(20_000), NOW)).toBe('Vừa xong');
  });

  it('hiển thị phút, giờ, ngày', () => {
    expect(timeAgo(ago(5 * 60_000), NOW)).toMatch(/5 phút/);
    expect(timeAgo(ago(3 * 3_600_000), NOW)).toMatch(/3 giờ/);
    expect(timeAgo(ago(3 * 86_400_000), NOW)).toMatch(/3 ngày/);
  });
});
