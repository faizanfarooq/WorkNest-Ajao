import { connectDB, disconnectDB } from './db.ts';
import { seed } from './seed.ts';

try {
  await connectDB();
  await seed({ reset: process.argv.includes('--reset') });
} catch (err: any) {
  console.error(err?.message ?? err);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
