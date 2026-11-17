import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  CommunityCard,
  TYPE_LABELS,
  useCommunities,
  useMyCommunities,
  type Community,
  type CommunityType,
} from '../features/communities';
import { ErrorState, IconSearch, Skeleton } from '../shared/ui';
import styles from './CommunitiesPage.module.css';

const TYPES: (CommunityType | '')[] = ['', 'UNIVERSITY', 'SUBJECT', 'INTEREST'];

/** Danh sách cộng đồng: tab Đã tham gia / Khám phá, lọc theo loại, tìm theo tên – mã môn – trường. */
export function CommunitiesPage() {
  const [params, setParams] = useSearchParams();
  const scope = params.get('tab') === 'discover' ? 'discover' : 'joined';
  const typeParam = params.get('type');
  const type = TYPES.includes(typeParam as CommunityType) ? (typeParam as CommunityType) : undefined;
  const q = params.get('q') ?? '';
  const [draft, setDraft] = useState(q);
  const { state, retry } = useCommunities({ scope, type, q });
  const { state: mine } = useMyCommunities();
  // Cập nhật thẻ tại chỗ sau khi tham gia/rời, không tải lại cả danh sách (tránh thẻ biến mất đột ngột)
  const [updated, setUpdated] = useState<Record<string, Community>>({});

  const update = (next: Record<string, string | undefined>) => {
    const merged = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
    setParams(merged, { replace: true });
  };

  // Gõ xong 300ms mới tìm, tránh gọi API theo từng phím
  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft.trim() !== q) update({ q: draft.trim() || undefined });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy lại khi nội dung ô tìm đổi
  }, [draft]);

  useEffect(() => setUpdated({}), [scope, type, q]);

  const joinedCount = mine.status === 'success' ? mine.data.length : null;
  const items = state.status === 'success' ? state.data.map((item) => updated[item.id] ?? item) : [];

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Cộng đồng</h1>
          <p className={styles.subtitle}>Tham gia cộng đồng theo trường, môn học và sở thích để tìm bạn học và đồng đội.</p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="Phạm vi">
          <button
            type="button"
            role="tab"
            aria-selected={scope === 'joined'}
            className={scope === 'joined' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => update({ tab: undefined })}
          >
            Đã tham gia
            {joinedCount !== null && <span className={styles.count}>{joinedCount}</span>}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={scope === 'discover'}
            className={scope === 'discover' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => update({ tab: 'discover' })}
          >
            Khám phá
          </button>
        </div>
        <label className={styles.search}>
          <IconSearch size={16} />
          <input
            type="search"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Tìm theo tên, mã môn hoặc trường…"
            aria-label="Tìm cộng đồng"
          />
        </label>
      </div>

      <div className={styles.chips} role="group" aria-label="Lọc theo loại">
        {TYPES.map((item) => (
          <button
            key={item || 'all'}
            type="button"
            aria-pressed={(type ?? '') === item}
            className={(type ?? '') === item ? `${styles.chip} ${styles.chipActive}` : styles.chip}
            onClick={() => update({ type: item || undefined })}
          >
            {item ? TYPE_LABELS[item] : 'Tất cả'}
          </button>
        ))}
      </div>

      {state.status === 'loading' && (
        <div className={styles.grid} role="status" aria-label="Đang tải cộng đồng">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} height="232px" />
          ))}
        </div>
      )}
      {state.status === 'error' && <ErrorState title="Không tải được cộng đồng" message={state.message} onRetry={retry} />}
      {state.status === 'success' && items.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>
            {q || type
              ? 'Không có cộng đồng nào khớp bộ lọc.'
              : scope === 'joined'
                ? 'Bạn chưa tham gia cộng đồng nào.'
                : 'Bạn đã tham gia tất cả cộng đồng hiện có.'}
          </p>
          {q || type ? (
            <button
              type="button"
              className={styles.emptyAction}
              onClick={() => {
                setDraft('');
                update({ q: undefined, type: undefined });
              }}
            >
              Xóa bộ lọc
            </button>
          ) : (
            scope === 'joined' && (
              <button type="button" className={styles.emptyAction} onClick={() => update({ tab: 'discover' })}>
                Khám phá cộng đồng
              </button>
            )
          )}
        </div>
      )}
      {items.length > 0 && (
        <div className={styles.grid}>
          {items.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onChange={(next) => setUpdated((map) => ({ ...map, [next.id]: next }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
