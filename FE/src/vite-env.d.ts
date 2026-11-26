/// <reference types="vite/client" />

/** Biến môi trường FE, khai báo trong FE/.env. */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_MOCK_API?: string;
  /** Danh sách feature luôn gọi BE thật, cách nhau bởi dấu phẩy (vd "auth,admin-users"). */
  readonly VITE_REAL_API_FEATURES?: string;
}
