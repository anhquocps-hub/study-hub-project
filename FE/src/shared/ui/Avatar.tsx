import styles from './Avatar.module.css';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'md' | 'lg';
}

/** Lấy chữ cái đầu của tên đầu và tên cuối: "Nguyễn Minh Tuấn" → "NT". */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}

/** Ảnh đại diện; chưa có ảnh thì hiện chữ cái đầu của tên. */
export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const className = `${styles.avatar} ${styles[size]}`;
  if (src) return <img className={className} src={src} alt={`Ảnh đại diện của ${name}`} />;
  return (
    <span className={className} role="img" aria-label={`Ảnh đại diện của ${name}`}>
      {getInitials(name)}
    </span>
  );
}
