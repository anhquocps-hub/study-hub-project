// Gọi Search API thật của BE.
import { request } from '../../../services/http-client';
import {
  filtersForTab,
  searchResponseSchema,
  type SearchFilters,
  type SearchPage,
  type SearchTab,
} from '../model/search-schemas';

export interface SearchQuery<T extends SearchTab = SearchTab> {
  tab: T;
  q: string;
  filters: SearchFilters;
  /** Con trỏ trang tiếp theo do BE trả về; bỏ trống = trang đầu. */
  cursor?: string;
}

export const PAGE_SIZE = 10;

/** GET /search?tab=&q=&<bộ lọc>&cursor=&limit= → { items, nextCursor, counts } */
export async function search<T extends SearchTab>(query: SearchQuery<T>, signal?: AbortSignal): Promise<SearchPage<T>> {
  const params = new URLSearchParams({ tab: query.tab, limit: String(PAGE_SIZE) });
  if (query.q) params.set('q', query.q);
  if (query.cursor) params.set('cursor', query.cursor);
  for (const [key, value] of Object.entries(filtersForTab(query.filters, query.tab))) params.set(key, value);
  const data = await request(`/search?${params}`, { signal });
  return searchResponseSchema(query.tab).parse(data) as SearchPage<T>;
}
