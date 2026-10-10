import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: { '@shared': path.resolve(import.meta.dirname, 'shared') },
  },
  test: {
    root: '.',
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 30_000,
    // First run downloads a MongoDB binary for mongodb-memory-server.
    hookTimeout: 300_000,
  },
});
