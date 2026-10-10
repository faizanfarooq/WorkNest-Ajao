import dotenv from 'dotenv';
dotenv.config();
import { connectDB, seedDefaultData, dbStore } from './db.ts';

async function runSeed() {
  console.log('[WorkNest Seed CLI] Initializing WorkNest Ajao database seed...');
  await connectDB();
  await dbStore.resetData();
  console.log('✅ Seed completed successfully!');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
