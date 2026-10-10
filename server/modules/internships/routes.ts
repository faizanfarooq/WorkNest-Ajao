import { Router } from 'express';
import type { QueryFilter, Types } from 'mongoose';
import {
  InternshipQuerySchema,
  InternshipSchema,
  InternshipStatusSchema,
  type InternshipInput,
  type InternshipQuery,
} from '../../../shared/schemas.ts';
import { assertObjectId, conflict, escapeRegex, notFound, validate } from '../../lib/http.ts';
import { auth, optionalAuth, requireAuth, requireRole } from '../../middleware/auth.ts';
import { ApplicationModel } from '../applications/model.ts';
import { CompanyModel } from '../companies/model.ts';
import { InternshipModel, SavedInternshipModel } from './model.ts';
import { monthlyPkr, openFilter, ownedInternship, serializeInternship } from './service.ts';

const router = Router();

const COMPANY_POPULATE = { path: 'companyId', select: 'name slug logoUrl city industry size tagline verified' };

/** Adds saved/applied flags for a signed-in student. */
async function studentFlags(userId: string | undefined, role: string | undefined, ids: Types.ObjectId[]) {
  if (!userId || role !== 'student' || ids.length === 0) return { saved: new Set<string>(), applied: new Map<string, string>() };
  const [saved, apps] = await Promise.all([
    SavedInternshipModel.find({ userId, internshipId: { $in: ids } }).select('internshipId').lean(),
    ApplicationModel.find({ studentId: userId, internshipId: { $in: ids } }).select('internshipId status').lean(),
  ]);
  return {
    saved: new Set(saved.map((s) => String(s.internshipId))),
    applied: new Map(apps.map((a) => [String(a.internshipId), String(a._id)])),
  };
}

router.get('/', optionalAuth, validate(InternshipQuerySchema, 'query'), async (req, res) => {
  const q = req.query as unknown as InternshipQuery;
  const filter: QueryFilter<any> = { ...openFilter() };

  if (q.q) filter.$text = { $search: q.q };
  if (q.city) filter.city = new RegExp(`^${escapeRegex(q.city)}$`, 'i');
  if (q.mode) filter.mode = q.mode;
  if (q.paid) filter.paid = q.paid === 'true';
  if (q.skill) filter.skills = new RegExp(`^${escapeRegex(q.skill)}$`, 'i');
  if (q.company) {
    const company = await CompanyModel.findOne({ slug: q.company }).select('_id').lean();
    filter.companyId = company?._id ?? null;
  }

  const sort: Record<string, any> =
    q.sort === 'pay'
      ? { payMonthlyPkr: -1, publishedAt: -1 }
      : q.sort === 'deadline'
        ? { deadline: 1, publishedAt: -1 }
        : q.q
          ? { score: { $meta: 'textScore' }, publishedAt: -1 }
          : { publishedAt: -1 };

  const [items, total] = await Promise.all([
    InternshipModel.find(filter, q.q ? { score: { $meta: 'textScore' } } : {})
      .sort(sort)
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .populate(COMPANY_POPULATE)
      .lean(),
    InternshipModel.countDocuments(filter),
  ]);

  const flags = await studentFlags(req.auth?.userId, req.auth?.role, items.map((i) => i._id));
  res.json({
    items: items.map((i) => ({
      ...serializeInternship(i),
      saved: flags.saved.has(String(i._id)),
      applicationId: flags.applied.get(String(i._id)) ?? null,
    })),
    total,
    page: q.page,
    pages: Math.max(Math.ceil(total / q.limit), 1),
  });
});

router.get('/popular-skills', async (_req, res) => {
  const skills = await InternshipModel.aggregate<{ _id: string; n: number }>([
    { $match: openFilter() },
    { $unwind: '$skills' },
    { $group: { _id: { $toLower: '$skills' }, label: { $first: '$skills' }, n: { $sum: 1 } } },
    { $sort: { n: -1, _id: 1 } },
    { $limit: 16 },
  ]);
  res.json({ skills: skills.map((s: any) => ({ name: s.label, count: s.n })) });
});

router.get('/stats', async (_req, res) => {
  const [openRoles, companies, applications] = await Promise.all([
    InternshipModel.countDocuments(openFilter()),
    CompanyModel.estimatedDocumentCount(),
    ApplicationModel.estimatedDocumentCount(),
  ]);
  res.json({ openRoles, companies, applications });
});

// ---------- Student: saved ----------

router.get('/saved', requireAuth, requireRole('student'), async (req, res) => {
  const saved = await SavedInternshipModel.find({ userId: auth(req).userId })
    .sort({ createdAt: -1 })
    .populate({ path: 'internshipId', populate: COMPANY_POPULATE })
    .lean();
  const items = saved.filter((s: any) => s.internshipId).map((s: any) => s.internshipId);
  const flags = await studentFlags(auth(req).userId, 'student', items.map((i: any) => i._id));
  res.json({
    items: items.map((i: any) => ({
      ...serializeInternship(i),
      saved: true,
      applicationId: flags.applied.get(String(i._id)) ?? null,
    })),
  });
});

router.post('/:id/save', requireAuth, requireRole('student'), async (req, res) => {
  const id = String(req.params.id);
  assertObjectId(id, 'Internship');
  if (!(await InternshipModel.exists({ _id: id }))) throw notFound('Internship');
  await SavedInternshipModel.updateOne(
    { userId: auth(req).userId, internshipId: id },
    { $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );
  res.status(204).end();
});

router.delete('/:id/save', requireAuth, requireRole('student'), async (req, res) => {
  await SavedInternshipModel.deleteOne({ userId: auth(req).userId, internshipId: String(req.params.id) });
  res.status(204).end();
});

// ---------- Employer: manage ----------

router.get('/mine', requireAuth, requireRole('employer'), async (req, res) => {
  const companyId = auth(req).companyId;
  const internships = await InternshipModel.find({ companyId }).sort({ createdAt: -1 }).lean();
  const counts = await ApplicationModel.aggregate<{ _id: { i: unknown; s: string }; n: number }>([
    { $match: { internshipId: { $in: internships.map((i) => i._id) } } },
    { $group: { _id: { i: '$internshipId', s: '$status' }, n: { $sum: 1 } } },
  ]);
  const byInternship = new Map<string, Record<string, number>>();
  for (const c of counts) {
    const key = String(c._id.i);
    byInternship.set(key, { ...byInternship.get(key), [c._id.s]: c.n });
  }
  res.json({
    items: internships.map((i) => ({
      ...serializeInternship(i, { _id: companyId }),
      viewCount: i.viewCount,
      statusCounts: byInternship.get(String(i._id)) ?? {},
    })),
  });
});

router.post('/', requireAuth, requireRole('employer'), validate(InternshipSchema), async (req, res) => {
  const input = req.body as InternshipInput;
  const ctx = auth(req);
  const internship = await InternshipModel.create({
    ...input,
    companyId: ctx.companyId,
    postedBy: ctx.userId,
    payMonthlyPkr: monthlyPkr(input),
    publishedAt: input.status === 'open' ? new Date() : undefined,
  });
  res.status(201).json({ internship: serializeInternship(internship.toObject(), { _id: ctx.companyId }) });
});

router.put('/:id', requireAuth, requireRole('employer'), validate(InternshipSchema), async (req, res) => {
  const id = String(req.params.id);
  assertObjectId(id, 'Internship');
  const internship = await ownedInternship(id, auth(req));
  const input = req.body as InternshipInput;
  // Editing a closed posting shouldn't silently reopen it.
  const status = internship.status === 'closed' ? 'closed' : input.status;
  internship.set({ ...input, status, payMonthlyPkr: monthlyPkr(input) });
  if (status === 'open' && !internship.publishedAt) internship.publishedAt = new Date();
  await internship.save();
  res.json({ internship: serializeInternship(internship.toObject(), { _id: internship.companyId }) });
});

router.patch('/:id/status', requireAuth, requireRole('employer'), validate(InternshipStatusSchema), async (req, res) => {
  const id = String(req.params.id);
  assertObjectId(id, 'Internship');
  const internship = await ownedInternship(id, auth(req));
  internship.status = req.body.status;
  if (internship.status === 'open' && !internship.publishedAt) internship.publishedAt = new Date();
  await internship.save();
  res.json({ internship: serializeInternship(internship.toObject(), { _id: internship.companyId }) });
});

router.delete('/:id', requireAuth, requireRole('employer'), async (req, res) => {
  const id = String(req.params.id);
  assertObjectId(id, 'Internship');
  const internship = await ownedInternship(id, auth(req));
  if (await ApplicationModel.exists({ internshipId: internship._id })) {
    throw conflict('This posting has applicants. Close it instead of deleting it.');
  }
  await Promise.all([internship.deleteOne(), SavedInternshipModel.deleteMany({ internshipId: internship._id })]);
  res.status(204).end();
});

// ---------- Public detail ----------

router.get('/:id', optionalAuth, async (req, res) => {
  const id = String(req.params.id);
  assertObjectId(id, 'Internship');
  const internship: any = await InternshipModel.findById(id).populate(COMPANY_POPULATE).lean();
  if (!internship) throw notFound('Internship');

  const isOwner = req.auth?.companyId && String(internship.companyId?._id) === req.auth.companyId;
  if (internship.status === 'draft' && !isOwner) throw notFound('Internship');
  if (!isOwner) void InternshipModel.updateOne({ _id: internship._id }, { $inc: { viewCount: 1 } }).exec();

  const flags = await studentFlags(req.auth?.userId, req.auth?.role, [internship._id]);
  res.json({
    internship: {
      ...serializeInternship(internship),
      saved: flags.saved.has(id),
      applicationId: flags.applied.get(id) ?? null,
      isOwner: Boolean(isOwner),
    },
  });
});

export default router;
