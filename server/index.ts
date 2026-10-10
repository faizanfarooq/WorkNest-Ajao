import { start } from './start.ts';

start().catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});
