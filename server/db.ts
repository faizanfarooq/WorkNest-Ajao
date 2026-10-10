import mongoose from 'mongoose';
import { env } from './config/env.ts';

// Reuse the connection across serverless invocations (Vercel) and hot reloads.
const globalForMongo = globalThis as unknown as { mongoPromise?: Promise<typeof mongoose> };

export async function connectDB(uri = env().MONGODB_URI) {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!globalForMongo.mongoPromise) {
    globalForMongo.mongoPromise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10_000, maxPoolSize: 10 })
      .catch((err) => {
        globalForMongo.mongoPromise = undefined;
        throw err;
      });
  }
  return globalForMongo.mongoPromise;
}

export async function disconnectDB() {
  globalForMongo.mongoPromise = undefined;
  await mongoose.disconnect();
}
