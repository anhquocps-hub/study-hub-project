/// <reference types="vite/client" />

/** Biến môi trường FE, khai báo trong FE/.env. */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_MOCK_API?: string;
}
