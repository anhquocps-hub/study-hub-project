import styles from './Skeleton.module.css';

interface SkeletonProps {
  /** Mặc định rộng 100%, cao 16px; có thể đặt kích thước qua className thay vì width/height. */
  width?: string;
  height?: string;
  className?: string;
}

/** Khối xám nhấp nháy giữ chỗ trong lúc tải danh sách/thẻ. Chỉ để trang trí. */
export function Skeleton({ width, height, className }: SkeletonProps) {
  return (
    <span
      className={[styles.skeleton, className].filter(Boolean).join(' ')}
      style={width || height ? { width, height } : undefined}
      aria-hidden="true"
    />
  );
}
