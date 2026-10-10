import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: 'web',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@shared': path.resolve(import.meta.dirname, 'shared') },
  },
  build: { outDir: '../dist', emptyOutDir: true },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:4000' },
  },
});
