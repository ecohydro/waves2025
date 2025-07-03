import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    // Include only integration tests
    include: ['**/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Longer timeout for integration tests that start servers
    testTimeout: 30000, // 30 seconds
    // Hook timeout for server startup/shutdown
    hookTimeout: 30000, // 30 seconds
    // Don't run integration tests in watch mode by default
    watch: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
