import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, GENERIC_ERROR } from '../../services/http-client';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

/**
 * Tải dữ liệu bất đồng bộ và trả về đủ ba trạng thái loading / error / success.
 * - Đổi `key` thì tải lại; gọi `retry()` để thử lại sau khi lỗi.
 * - Rời trang hoặc đổi key giữa chừng thì hủy request cũ.
 */
export function useAsyncData<T>(key: string, load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [reloadCount, setReloadCount] = useState(0);
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load; // luôn dùng hàm load mới nhất mà không phải tải lại mỗi lần render
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    loadRef
      .current(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', message: error instanceof ApiError ? error.message : GENERIC_ERROR });
      });
    return () => controller.abort();
  }, [key, reloadCount]);

  const retry = useCallback(() => setReloadCount((count) => count + 1), []);
  return { state, retry };
}
