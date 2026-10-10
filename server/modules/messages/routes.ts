import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { MessageSchema } from '../../../shared/schemas.ts';
import { assertObjectId, badRequest, forbidden, notFound, validate } from '../../lib/http.ts';
import { auth, requireAuth, requireRole, type AuthContext } from '../../middleware/auth.ts';
import { ApplicationModel } from '../applications/model.ts';
import { CompanyModel } from '../companies/model.ts';
import { notify } from '../notifications/model.ts';
import { ConversationModel, MessageModel } from './model.ts';

const router = Router();
router.use(requireAuth);

type Side = 'student' | 'company';

function sideOf(convo: any, ctx: AuthContext): Side {
  if (ctx.role === 'student' && String(convo.studentId?._id ?? convo.studentId) === ctx.userId) return 'student';
  if (ctx.role === 'employer' && String(convo.companyId?._id ?? convo.companyId) === ctx.companyId) return 'company';
  throw forbidden();
}

const scopeFilter = (ctx: AuthContext) =>
  ctx.role === 'student' ? { studentId: ctx.userId } : ctx.role === 'employer' ? { companyId: ctx.companyId } : { _id: null };

const POPULATE = [
  { path: 'studentId', select: 'name' },
  { path: 'companyId', select: 'name slug logoUrl' },
  { path: 'internshipId', select: 'title' },
];

function serialize(c: any, side: Side) {
  return {
    _id: c._id,
    applicationId: c.applicationId,
    internship: c.internshipId ? { _id: c.internshipId._id, title: c.internshipId.title } : null,
    student: c.studentId ? { _id: c.studentId._id, name: c.studentId.name } : null,
    company: c.companyId ? { _id: c.companyId._id, name: c.companyId.name, slug: c.companyId.slug, logoUrl: c.companyId.logoUrl } : null,
    lastMessageAt: c.lastMessageAt,
    lastMessagePreview: c.lastMessagePreview,
    unread: side === 'student' ? c.unreadForStudent : c.unreadForCompany,
  };
}

router.get('/', async (req, res) => {
  const ctx = auth(req);
  const convos = await ConversationModel.find(scopeFilter(ctx)).sort({ lastMessageAt: -1 }).limit(100).populate(POPULATE).lean();
  res.json({ items: convos.map((c) => serialize(c, ctx.role === 'student' ? 'student' : 'company')) });
});

router.get('/unread-count', async (req, res) => {
  const ctx = auth(req);
  const field = ctx.role === 'student' ? '$unreadForStudent' : '$unreadForCompany';
  const [row] = await ConversationModel.aggregate([{ $match: castScope(ctx) }, { $group: { _id: null, n: { $sum: field } } }]);
  res.json({ count: row?.n ?? 0 });
});

// aggregate() doesn't cast strings to ObjectIds the way find() does.
function castScope(ctx: AuthContext) {
  if (ctx.role === 'student') return { studentId: new Types.ObjectId(ctx.userId) };
  if (ctx.role === 'employer' && ctx.companyId) return { companyId: new Types.ObjectId(ctx.companyId) };
  return { _id: null };
}

/** Employers open a thread from an application; students reply once one exists. */
router.post(
  '/',
  requireRole('employer'),
  validate(z.object({ applicationId: z.string() })),
  async (req, res) => {
    const ctx = auth(req);
    assertObjectId(req.body.applicationId, 'Application');
    const app = await ApplicationModel.findOne({ _id: req.body.applicationId, companyId: ctx.companyId }).lean();
    if (!app) throw notFound('Application');

    const convo = await ConversationModel.findOneAndUpdate(
      { applicationId: app._id },
      {
        $setOnInsert: {
          applicationId: app._id,
          internshipId: app.internshipId,
          studentId: app.studentId,
          companyId: app.companyId,
          lastMessageAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' },
    )
      .populate(POPULATE)
      .lean();
    res.status(201).json({ conversation: serialize(convo, 'company') });
  },
);

router.get(
  '/:id/messages',
  validate(z.object({ after: z.coerce.date().optional() }), 'query'),
  async (req, res) => {
    const id = String(req.params.id);
    assertObjectId(id, 'Conversation');
    const ctx = auth(req);
    const convo = await ConversationModel.findById(id).populate(POPULATE).lean();
    if (!convo) throw notFound('Conversation');
    const side = sideOf(convo, ctx);

    const { after } = req.query as { after?: Date };
    const messages = await MessageModel.find({ conversationId: id, ...(after ? { createdAt: { $gt: after } } : {}) })
      .sort({ createdAt: 1 })
      .limit(500)
      .lean();

    const unreadField = side === 'student' ? 'unreadForStudent' : 'unreadForCompany';
    if ((convo as any)[unreadField] > 0) await ConversationModel.updateOne({ _id: id }, { [unreadField]: 0 });

    res.json({ conversation: serialize({ ...convo, [unreadField]: 0 }, side), side, messages });
  },
);

router.post('/:id/messages', validate(MessageSchema), async (req, res) => {
  const id = String(req.params.id);
  assertObjectId(id, 'Conversation');
  const ctx = auth(req);
  const convo = await ConversationModel.findById(id);
  if (!convo) throw notFound('Conversation');
  const side = sideOf(convo, ctx);
  if (ctx.role === 'admin') throw badRequest('Admins cannot post in conversations');

  const message = await MessageModel.create({ conversationId: id, senderId: ctx.userId, side, body: req.body.body });
  const otherUnread = side === 'student' ? 'unreadForCompany' : 'unreadForStudent';
  const before = await ConversationModel.findByIdAndUpdate(id, {
    lastMessageAt: message.createdAt,
    lastMessagePreview: message.body.slice(0, 140),
    $inc: { [otherUnread]: 1 },
  }).lean();

  // Only notify on the first unread message so a busy thread doesn't flood the bell.
  if (before && (before as any)[otherUnread] === 0) {
    const recipients =
      side === 'student' ? ((await CompanyModel.findById(convo.companyId).select('members').lean())?.members ?? []) : [convo.studentId];
    await notify(recipients, { title: 'New message', body: message.body.slice(0, 100), link: `/messages/${id}` });
  }

  res.status(201).json({ message });
});

export default router;
