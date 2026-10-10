import { defineConfig } from 'vitest/config';

export default defineConfig({
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
