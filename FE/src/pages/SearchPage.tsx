import { useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import iconFilter from '../assets/figma/feed-filter.svg';
import iconSearchBtn from '../assets/figma/feed-search-btn.svg';
import iconSearch from '../assets/figma/feed-search.svg';
import { useMajors, useUniversities } from '../features/academic';
import { CommunityCard, type Community } from '../features/communities';
import { PostCard, postsApi, type Post } from '../features/posts';
import {
  AdvancedFilterModal,
  FILTER_KEYS,
  filtersForTab,
  filtersFromParams,
  GroupCard,
  LEVEL_LABELS,
  PersonCard,
  POST_TYPE_LABELS,
  ROLE_LABELS,
  searchTabSchema,
  STATUS_LABELS,
  TAB_LABELS,
  termLabel,
  useSearch,
  type FilterKey,
  type SearchFilters,
  type SearchTab,
} from '../features/search';
import { ApiError, GENERIC_ERROR } from '../services/http-client';
import { ErrorState, IconX, Skeleton } from '../shared/ui';
import styles from './SearchPage.module.css';

const TABS = searchTabSchema.options;

const FILTER_NAMES: Record<FilterKey, string> = {
  universityId: 'Trường',
  majorId: 'Ngành',
  subject: 'Môn',
  classCode: 'Mã lớp',
  lecturer: 'Giảng viên',
  term: 'Học kỳ',
  skill: 'Kỹ năng',
  technology: 'Công nghệ',
  role: 'Vai trò',
  level: 'Trình độ',
  postType: 'Loại bài',
  status: 'Trạng thái',
};

function Results({ tab, search }: { tab: SearchTab; search: ReturnType<typeof useSearch> }) {
  const { state, retry, items, hasMore, loadMore, loadingMore, moreError } = search;
  // Thích bài / tham gia cộng đồng xong thì cập nhật thẻ tại chỗ
  const [updated, setUpdated] = useState<Record<string, Post | Community>>({});
  const [likeError, setLikeError] = useState<string | null>(null);

  if (state.status === 'loading')
    return (
      <div className={styles.list} role="status" aria-label="Đang tìm kiếm">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} height="120px" />
        ))}
      </div>
    );
  if (state.status === 'error') return <ErrorState title="Không tìm kiếm được" message={state.message} onRetry={retry} />;
  if (items.length === 0)
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Không có {TAB_LABELS[tab].toLowerCase()} nào phù hợp.</p>
        <p className={styles.emptyHint}>Thử từ khóa khác, bỏ bớt bộ lọc hoặc xem các tab còn lại.</p>
      </div>
    );

  const toggleLike = async (post: Post) => {
    setLikeError(null);
    try {
      const next = await postsApi.toggleLike(post.id);
      setUpdated((map) => ({ ...map, [next.id]: next }));
    } catch (error) {
      setLikeError(error instanceof ApiError ? error.message : GENERIC_ERROR);
    }
  };

  return (
    <>
      {likeError && (
        <p className={styles.error} role="alert">
          {likeError}
        </p>
      )}
      <div className={tab === 'communities' ? styles.grid : styles.list}>
        {items.map((raw) => {
          const item = updated[raw.id] ?? raw;
          if (tab === 'posts') {
            const post = item as Post;
            return (
              <PostCard
                key={post.id}
                post={post}
                // Sửa/xóa bài làm ở Bảng tin; trang tìm kiếm chỉ xem và thích
                isMine={false}
                onEdit={() => undefined}
                onDelete={async () => undefined}
                onToggleLike={toggleLike}
              />
            );
          }
          if (tab === 'communities')
            return (
              <CommunityCard
                key={item.id}
                community={item as Community}
                onChange={(next) => setUpdated((map) => ({ ...map, [next.id]: next }))}
              />
            );
          if (tab === 'people') return <PersonCard key={item.id} person={item as never} />;
          return <GroupCard key={item.id} group={item as never} />;
        })}
      </div>
      {hasMore && (
        <div className={styles.more}>
          <button type="button" className={styles.moreBtn} onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Đang tải…' : 'Xem thêm kết quả'}
          </button>
          {moreError && (
            <p className={styles.error} role="alert">
              {moreError}
            </p>
          )}
        </div>
      )}
    </>
  );
}

/** /search — tìm Bài viết / Người / Cộng đồng / Nhóm (PRD mục 27). Từ khóa, tab và bộ lọc nằm trên URL. */
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const tabParam = searchTabSchema.safeParse(params.get('tab'));
  const tab: SearchTab = tabParam.success ? tabParam.data : 'posts';
  const q = (params.get('q') ?? '').trim().slice(0, 120);
  const filters = filtersFromParams(params);
  const applied = filtersForTab(filters, tab);
  const [filterOpen, setFilterOpen] = useState(false);
  const search = useSearch(tab, q, filters);
  // Giữ số đếm cũ trong lúc tải tab mới để các tab không bị nháy số
  const lastCounts = useRef(search.counts);
  if (search.counts) lastCounts.current = search.counts;
  const counts = lastCounts.current;
  const { state: universities } = useUniversities();
  const { state: majors } = useMajors(filters.universityId ?? '');

  const write = (next: { q?: string; tab?: SearchTab; filters?: SearchFilters }) => {
    const merged = new URLSearchParams();
    const nextQ = next.q ?? q;
    const nextTab = next.tab ?? tab;
    if (nextQ) merged.set('q', nextQ);
    if (nextTab !== 'posts') merged.set('tab', nextTab);
    for (const [key, value] of Object.entries(next.filters ?? filters)) if (value) merged.set(key, value);
    setParams(merged);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    write({ q: new FormData(event.currentTarget).get('q')?.toString().trim() ?? '' });
  };

  const labelOf = (key: FilterKey, value: string) => {
    if (key === 'universityId')
      return universities.status === 'success' ? (universities.data.find((item) => item.id === value)?.name ?? value) : value;
    if (key === 'majorId') return majors.status === 'success' ? (majors.data.find((item) => item.id === value)?.name ?? value) : value;
    if (key === 'term') return termLabel(value);
    if (key === 'role') return ROLE_LABELS[value as keyof typeof ROLE_LABELS];
    if (key === 'level') return LEVEL_LABELS[value as keyof typeof LEVEL_LABELS];
    if (key === 'postType') return POST_TYPE_LABELS[value as keyof typeof POST_TYPE_LABELS];
    if (key === 'status') return STATUS_LABELS[value as keyof typeof STATUS_LABELS];
    return value;
  };

  const remove = (key: FilterKey) => {
    const next = { ...filters, [key]: undefined };
    if (key === 'universityId') next.majorId = undefined;
    write({ filters: next });
  };

  const appliedKeys = FILTER_KEYS.filter((key) => applied[key]);
  const ignoredCount = FILTER_KEYS.filter((key) => filters[key] && !applied[key]).length;

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <header>
        <h1 className={styles.title}>{q ? <>Kết quả cho “{q}”</> : 'Tìm kiếm'}</h1>
        <p className={styles.subtitle}>Tìm bài viết, bạn học, cộng đồng và nhóm theo trường, môn học hoặc kỹ năng.</p>
      </header>

      <form className={styles.searchBar} role="search" onSubmit={submit} key={q}>
        <label className={styles.searchInput}>
          <img src={iconSearch} alt="" className={styles.searchIcon} />
          <input
            name="q"
            type="search"
            defaultValue={q}
            maxLength={120}
            placeholder="Tìm môn học, project, đồng đội, giảng viên..."
            aria-label="Từ khóa tìm kiếm"
          />
        </label>
        <button type="submit" className={styles.primaryBtn} aria-label="Tìm kiếm">
          <img src={iconSearchBtn} alt="" />
          <span className={styles.btnText}>Tìm kiếm</span>
        </button>
        <button type="button" className={styles.filterBtn} onClick={() => setFilterOpen(true)}>
          <img src={iconFilter} alt="" />
          <span className={styles.btnText}>Bộ lọc nâng cao</span>
          {appliedKeys.length > 0 && <span className={styles.filterCount}>{appliedKeys.length}</span>}
        </button>
      </form>

      <div className={styles.tabs} role="tablist" aria-label="Loại kết quả">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={tab === item ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => write({ tab: item })}
          >
            {TAB_LABELS[item]}
            {counts && <span className={styles.count}>{counts[item]}</span>}
          </button>
        ))}
      </div>

      {(appliedKeys.length > 0 || ignoredCount > 0) && (
        <div className={styles.pills} aria-label="Bộ lọc đang áp dụng">
          {appliedKeys.map((key) => (
            <span key={key} className={styles.pill}>
              <span className={styles.pillName}>{FILTER_NAMES[key]}:</span> {labelOf(key, applied[key] as string)}
              <button type="button" className={styles.pillRemove} onClick={() => remove(key)} aria-label={`Bỏ lọc ${FILTER_NAMES[key]}`}>
                <IconX size={16} />
              </button>
            </span>
          ))}
          {ignoredCount > 0 && (
            <span className={styles.ignored}>{ignoredCount} bộ lọc không áp dụng cho tab {TAB_LABELS[tab]}</span>
          )}
          <button type="button" className={styles.clearAll} onClick={() => write({ filters: {} })}>
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}

      <section aria-label={`Kết quả ${TAB_LABELS[tab]}`} role="tabpanel">
        <Results key={tab} tab={tab} search={search} />
      </section>

      {filterOpen && (
        <AdvancedFilterModal tab={tab} value={filters} onApply={(next) => write({ filters: next })} onClose={() => setFilterOpen(false)} />
      )}
    </div>
  );
}
