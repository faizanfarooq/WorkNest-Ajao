import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
  root: 'web',
  // Read .env from the repo root (only VITE_* variables ever reach the browser).
  envDir: import.meta.dirname,
  // GitHub Pages serves the demo from /<repo>/; everywhere else the app sits at the root.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  // `--mode demo` swaps the network API for the in-browser demo backend.
  define: mode === 'demo' ? { 'import.meta.env.VITE_DEMO': JSON.stringify('true') } : {},
  resolve: {
    alias: { '@shared': path.resolve(import.meta.dirname, 'shared') },
  },
  build: { outDir: '../dist', emptyOutDir: true },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:4000' },
  },
}));
