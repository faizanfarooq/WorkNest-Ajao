import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createApp } from './app.ts';
import { env } from './config/env.ts';
import { connectDB } from './db.ts';

export async function start() {
  const { PORT } = env();
  await connectDB();
  console.log('[db] connected');

  const app = createApp();

  // `npm run build && npm start` serves the built frontend from the same process.
  const dist = path.resolve(import.meta.dirname, '../dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist, { index: false, maxAge: '1h' }));
    app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`));
}

