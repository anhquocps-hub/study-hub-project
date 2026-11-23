/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Test luôn chạy với API giả, không gọi BE thật.
    env: { VITE_USE_MOCK_API: 'true' },
    restoreMocks: true,
  },
});
