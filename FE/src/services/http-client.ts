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

// ——— Sự kiện phiên đăng nhập (AuthProvider lắng nghe) ———

export type AuthEvent = 'expired' | 'banned';
type AuthEventListener = (event: AuthEvent, message: string) => void;
const authListeners = new Set<AuthEventListener>();

/** Đăng ký nghe sự kiện hết phiên / bị khóa; trả về hàm hủy đăng ký. */
export function onAuthEvent(listener: AuthEventListener): () => void {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

function emitAuthEvent(event: AuthEvent, message: string) {
  authListeners.forEach((listener) => listener(event, message));
}

export const SESSION_EXPIRED_MESSAGE = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';

/** Các API xác thực: 401 ở đây là lỗi thật (sai mật khẩu, refresh token hỏng…), không refresh rồi thử lại. */
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
];

/** BE trả 403 với thông báo bắt đầu bằng câu này khi tài khoản bị khóa (middleware, login, refresh). */
const BANNED_PREFIX = 'Tài khoản của bạn đã bị khóa';

type RefreshResult = { ok: true } | { ok: false; bannedMessage: string | null };

let refreshInFlight: Promise<RefreshResult> | null = null;

/**
 * Xin access token mới bằng refresh token (cookie). Nhiều request cùng gặp 401 thì dùng chung MỘT lần refresh:
 * BE xoay vòng refresh token (mỗi token dùng 1 lần), gọi song song sẽ làm các lần sau bị từ chối.
 */
function refreshSession(): Promise<RefreshResult> {
  refreshInFlight ??= fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
    .then(async (response): Promise<RefreshResult> => {
      if (response.ok) return { ok: true };
      const error = await toApiError(response);
      return { ok: false, bannedMessage: isBannedError(error) ? error.message : null };
    })
    .catch((): RefreshResult => ({ ok: false, bannedMessage: null }))
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

async function send(path: string, init: RequestInit): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = init.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal;
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
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
}

function isBannedError(error: ApiError) {
  return error.status === 403 && error.message.startsWith(BANNED_PREFIX);
}

async function toApiError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null);
  const { message, fieldErrors } = parseErrorBody(body);
  return new ApiError(response.status, message, fieldErrors);
}

export async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  let response = await send(path, init);

  const isAuthPath = NO_REFRESH_PATHS.includes(path.split('?')[0]);

  // Access token hết hạn (15 phút): refresh một lần rồi gửi lại.
  if (response.status === 401 && !isAuthPath) {
    const refreshed = await refreshSession();
    if (refreshed.ok) {
      response = await send(path, init);
    } else {
      const error = await toApiError(response);
      if (refreshed.bannedMessage) emitAuthEvent('banned', refreshed.bannedMessage);
      else emitAuthEvent('expired', SESSION_EXPIRED_MESSAGE);
      throw error;
    }
  }

  if (response.status === 204) return null;
  if (!response.ok) {
    const error = await toApiError(response);
    // Bị khóa giữa phiên: đăng xuất ở FE. (Ở /auth/login thì form tự hiện lỗi, không cần sự kiện.)
    if (!isAuthPath && isBannedError(error)) emitAuthEvent('banned', error.message);
    throw error;
  }
  return response.json().catch(() => null);
}

/** Thông báo lỗi an toàn để hiện cho người dùng: chỉ dùng message của ApiError, còn lại là lỗi chung. */
export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_ERROR;
}
