import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    maxWorkers: 1,
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    // Exclude integration tests and external directories
    exclude: ['**/integration/**', '**/node_modules/**', '**/dist/**', '**/.next/**'],
    // Include integration tests only when explicitly requested
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
