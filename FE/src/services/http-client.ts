/**
 * HTTP client dùng chung cho mọi request tới BE.
 * - Gửi kèm cookie phiên đăng nhập (credentials: 'include').
 * - Quá 15 giây không có phản hồi thì tự hủy request.
 * - Mọi lỗi được chuyển thành ApiError để giao diện hiển thị thống nhất.
 * - Trả về unknown: nơi gọi phải kiểm tra dữ liệu (bằng zod) trước khi dùng.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
const REQUEST_TIMEOUT_MS = 15_000;

export const GENERIC_ERROR = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
const NETWORK_ERROR = 'Không kết nối được máy chủ. Vui lòng thử lại.';
const TIMEOUT_ERROR = 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.';

export class ApiError extends Error {
  /** HTTP status của response; 0 nghĩa là lỗi mạng hoặc quá thời gian chờ. */
  readonly status: number;
  /** Lỗi theo từng trường form do BE trả về, ví dụ { email: 'Email đã được sử dụng.' }. */
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Đọc body lỗi theo định dạng: { message, fieldErrors? }. */
function parseErrorBody(body: unknown): { message: string; fieldErrors: Record<string, string> } {
  if (typeof body !== 'object' || body === null) return { message: GENERIC_ERROR, fieldErrors: {} };
  const { message, fieldErrors } = body as { message?: unknown; fieldErrors?: unknown };

  const validFieldErrors: Record<string, string> = {};
  if (typeof fieldErrors === 'object' && fieldErrors !== null) {
    for (const [field, value] of Object.entries(fieldErrors)) {
      if (typeof value === 'string') validFieldErrors[field] = value;
    }
  }

  return {
    message: typeof message === 'string' && message !== '' ? message : GENERIC_ERROR,
    fieldErrors: validFieldErrors,
  };
}

export async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = init.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal,
      credentials: 'include',
      // Chỉ gắn Content-Type khi có body, để request GET không phải qua bước CORS preflight.
      headers: init.body === undefined ? undefined : { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (init.signal?.aborted) throw error; // Nơi gọi chủ động hủy: giữ nguyên lỗi gốc.
    if (timeoutSignal.aborted) throw new ApiError(0, TIMEOUT_ERROR);
    throw new ApiError(0, NETWORK_ERROR);
  }

  if (response.status === 204) return null;
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const { message, fieldErrors } = parseErrorBody(body);
    throw new ApiError(response.status, message, fieldErrors);
  }
  return body;
}
