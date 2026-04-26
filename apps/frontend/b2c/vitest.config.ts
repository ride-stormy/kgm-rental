import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: false,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['lib/**/*.test.ts', 'app/**/*.test.ts', 'app/**/*.test.tsx'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['lib/inventory/**/*.ts', 'app/api/inventories/**/*.ts'],
      exclude: ['**/*.test.ts'],
    },
  },
});
