const relativeTime = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });

/** "Vừa xong", "5 phút trước", "2 giờ trước", "3 ngày trước"... */
export function timeAgo(iso: string, now = Date.now()) {
  const minutes = Math.round((new Date(iso).getTime() - now) / 60_000);
  if (minutes > -1) return 'Vừa xong';
  if (minutes > -60) return relativeTime.format(minutes, 'minute');
  if (minutes > -60 * 24) return relativeTime.format(Math.round(minutes / 60), 'hour');
  return relativeTime.format(Math.round(minutes / 1440), 'day');
}

const fullDate = new Intl.DateTimeFormat('vi', { dateStyle: 'medium', timeStyle: 'short' });

/** Ngày giờ đầy đủ cho tooltip, ví dụ "9 thg 11, 2026, 15:30". */
export function formatFullDate(iso: string) {
  return fullDate.format(new Date(iso));
}
