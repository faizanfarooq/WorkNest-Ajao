/**
 * Runs the API against a throwaway in-memory MongoDB, seeded with demo data.
 * Handy for trying the app without Atlas. Everything is lost when the process stops.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 120_000 } });
process.env.MONGODB_URI = mongo.getUri('worknest');
process.env.JWT_SECRET ??= 'dev-memory-only-secret-not-for-real-use-0123456789';

const { connectDB } = await import('./db.ts');
const { seed } = await import('./seed.ts');
const { start } = await import('./start.ts');

await connectDB();
await seed();
await start();

const stop = async () => {
  await mongo.stop();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
