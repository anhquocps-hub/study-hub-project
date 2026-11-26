/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Test luôn chạy với API giả, không gọi BE thật (kể cả khi .env.local bật VITE_REAL_API_FEATURES).
    env: { VITE_USE_MOCK_API: 'true', VITE_REAL_API_FEATURES: '' },
    restoreMocks: true,
  },
});
