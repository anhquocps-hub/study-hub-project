import { useEffect, useRef, useState } from 'react';
import { ApiError, GENERIC_ERROR } from '../../../services/http-client';
import { useAsyncData, type AsyncState } from '../../../shared/hooks/use-async-data';
import { searchApi } from '../api';
import { filtersForTab, type SearchFilters, type SearchItem, type SearchPage, type SearchTab } from '../model/search-schemas';

/**
 * Kết quả tìm kiếm của một tab: trang đầu tải tự động; loadMore() nối thêm trang sau.
 * Đổi từ khóa, tab hoặc bộ lọc thì tải lại từ đầu.
 */
export function useSearch<T extends SearchTab>(tab: T, q: string, filters: SearchFilters) {
  const applied = filtersForTab(filters, tab);
  const key = `search:${tab}:${q}:${JSON.stringify(applied)}`;
  const { state: raw, retry } = useAsyncData(key, (signal) =>
    searchApi.search({ tab, q, filters: applied }, signal).then((page) => ({ key, page })),
  );
  // Ngay sau khi đổi tab/từ khóa, raw vẫn giữ dữ liệu của truy vấn cũ một lần render: coi như đang tải
  const state: AsyncState<SearchPage<T>> =
    raw.status !== 'success'
      ? raw
      : raw.data.key === key
        ? { status: 'success', data: raw.data.page as SearchPage<T> }
        : { status: 'loading' };

  const [extra, setExtra] = useState<SearchItem[T][]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const firstPage = state.status === 'success' ? state.data : null;
  const currentKey = useRef(key);
  currentKey.current = key;

  useEffect(() => {
    setExtra([]);
    setMoreError(null);
    setCursor(firstPage?.nextCursor ?? null);
  }, [firstPage]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    const requestKey = key;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const page = await searchApi.search({ tab, q, filters: applied, cursor });
      if (currentKey.current !== requestKey) return; // đã đổi tab/từ khóa/bộ lọc: bỏ trang của truy vấn cũ
      setExtra((list) => [...list, ...page.items]);
      setCursor(page.nextCursor);
    } catch (error) {
      setMoreError(error instanceof ApiError ? error.message : GENERIC_ERROR);
    } finally {
      setLoadingMore(false);
    }
  };

  const items = firstPage ? [...firstPage.items, ...extra] : [];
  return { state, retry, items, counts: firstPage?.counts ?? null, hasMore: cursor !== null, loadMore, loadingMore, moreError };
}
