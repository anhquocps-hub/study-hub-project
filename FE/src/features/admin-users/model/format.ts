/** Số theo kiểu thiết kế: 14,820. */
export function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

/** "18/09/2021" và "14:22:05" theo giờ máy người dùng. */
export function formatDateTime(iso: string): { date: string; time: string } {
  const value = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`,
    time: `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`,
  };
}

/** Ô trống cho trường BE chưa có. */
export const EMPTY_CELL = '—';
