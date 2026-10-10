import express, { type Request, type Response } from 'express';
import { dbStore, seedDefaultData } from '../db.ts';

const router = express.Router();

/**
 * @route   GET /api/dev/status
 * @desc    Get live database stats and health check
 */
router.get('/status', async (_req: Request, res: Response) => {
  const dbState = await dbStore.getState();
  return res.status(200).json({
    status: 'online',
    platform: 'WorkNest Ajao Backend REST API',
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
    pakistanStandardTime: new Date(Date.now() + 5 * 3600 * 1000).toISOString().replace('Z', '+05:00'),
    database: {
      type: dbState.isMongooseConnected ? 'MongoDB (Connected)' : 'In-Memory Mongoose Compatible Store',
      counts: dbState.counts,
    },
    version: '1.0.0',
  });
});

/**
 * @route   GET /api/dev/dump
 * @desc    Inspect all seeded collections
 */
router.get('/dump', async (_req: Request, res: Response) => {
  return res.status(200).json(await dbStore.getState());
});

/**
 * @route   POST /api/dev/reset-seed
 * @desc    Reset data to standard pre-configured seed state
 */
router.post('/reset-seed', async (_req: Request, res: Response) => {
  await dbStore.resetData();
  return res.status(200).json({
    success: true,
    message: 'WorkNest database successfully reset and re-seeded with Muhammad Faizan Farooq and Lahore startup founders.',
  });
});

export default router;
