import type { DirectoryStats } from '../model/admin-user-schemas';
import { EMPTY_CELL, formatCount } from '../model/format';
import styles from './UserDirectory.module.css';

interface StatTileProps {
  label: string;
  value: string;
  aside?: string;
  tone: 'text' | 'green' | 'purple' | 'red' | 'accent';
  /** Tỉ lệ thanh dưới (0–1). */
  fill: number;
  live?: boolean;
}

function StatTile({ label, value, aside, tone, fill, live }: StatTileProps) {
  return (
    <div className={styles.stat}>
      <p className={styles.statLabel}>
        {label}
        {live && <span className={styles.liveDot} aria-hidden="true" />}
      </p>
      <p className={styles.statValueRow}>
        <span className={`${styles.statValue} ${styles[`stat_${tone}`]}`}>{value}</span>
        {aside && <span className={`${styles.statAside} ${styles[`statAside_${tone}`]}`}>{aside}</span>}
      </p>
      <span className={styles.statBar} aria-hidden="true">
        <span className={styles[`bar_${tone}`]} style={{ width: `${Math.round(fill * 100)}%` }} />
      </span>
    </div>
  );
}

/** 5 ô thống kê (Figma "KPI Metagrid"). Toàn bộ là dữ liệu mở rộng: null thì mỗi ô hiện "—". */
export function DirectoryStatsGrid({ stats }: { stats: DirectoryStats | null }) {
  const show = (value: number | undefined) => (value === undefined ? EMPTY_CELL : formatCount(value));
  return (
    <section className={styles.stats} aria-label="Thống kê người dùng">
      <StatTile label="TỔNG NGƯỜI DÙNG" value={show(stats?.total.value)} aside={stats?.total.delta} tone="text" fill={stats ? 0.84 : 0} />
      <StatTile
        label="ĐANG TRỰC TUYẾN"
        value={show(stats?.online.value)}
        aside={stats?.online.ratio}
        tone="green"
        fill={stats ? 0.42 : 0}
        live
      />
      <StatTile label="CẢNH BÁO (≥2 GẬY)" value={show(stats?.warned.value)} aside={stats ? 'Theo dõi' : undefined} tone="purple" fill={stats ? 0.15 : 0} />
      <StatTile label="KHÓA / BANNED" value={show(stats?.banned.value)} aside={stats?.banned.ratio} tone="red" fill={stats ? 0.08 : 0} />
      <StatTile label="GIẢNG VIÊN / TA" value={show(stats?.staff.value)} aside={stats ? 'Verified' : undefined} tone="accent" fill={stats ? 0.65 : 0} />
    </section>
  );
}
