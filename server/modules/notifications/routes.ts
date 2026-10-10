import { Router } from 'express';
import { auth, requireAuth } from '../../middleware/auth.ts';
import { NotificationModel } from './model.ts';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const userId = auth(req).userId;
  const [items, unread] = await Promise.all([
    NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(30).lean(),
    NotificationModel.countDocuments({ userId, readAt: { $exists: false } }),
  ]);
  res.json({ items, unread });
});

router.post('/read-all', async (req, res) => {
  await NotificationModel.updateMany({ userId: auth(req).userId, readAt: { $exists: false } }, { readAt: new Date() });
  res.status(204).end();
});

export default router;
