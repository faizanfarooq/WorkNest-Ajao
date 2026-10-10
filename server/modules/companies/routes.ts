import { Router } from 'express';
import { z } from 'zod';
import { CompanySchema } from '../../../shared/schemas.ts';
import { escapeRegex, notFound, validate } from '../../lib/http.ts';
import { auth, requireAuth, requireRole } from '../../middleware/auth.ts';
import { InternshipModel } from '../internships/model.ts';
import { openFilter, serializeInternship } from '../internships/service.ts';
import { CompanyModel } from './model.ts';

const router = Router();

const PUBLIC_FIELDS = 'name slug tagline about website logoUrl city industry size verified createdAt';

router.get('/', validate(z.object({ q: z.string().trim().max(80).optional() }), 'query'), async (req, res) => {
  const { q } = req.query as { q?: string };
  const filter = q ? { name: new RegExp(escapeRegex(q), 'i') } : {};
  const companies = await CompanyModel.find(filter).select(PUBLIC_FIELDS).sort({ name: 1 }).limit(100).lean();

  const counts = await InternshipModel.aggregate<{ _id: unknown; n: number }>([
    { $match: { ...openFilter(), companyId: { $in: companies.map((c) => c._id) } } },
    { $group: { _id: '$companyId', n: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));

  res.json({
    companies: companies
      .map((c) => ({ ...c, openRoles: byId.get(String(c._id)) ?? 0 }))
      .sort((a, b) => b.openRoles - a.openRoles),
  });
});

router.get('/mine', requireAuth, requireRole('employer'), async (req, res) => {
  const company = await CompanyModel.findById(auth(req).companyId).lean();
  if (!company) throw notFound('Company');
  res.json({ company });
});

router.put('/mine', requireAuth, requireRole('employer'), validate(CompanySchema), async (req, res) => {
  // The slug stays fixed after creation so shared links keep working.
  const company = await CompanyModel.findByIdAndUpdate(auth(req).companyId, req.body, { returnDocument: 'after' }).lean();
  if (!company) throw notFound('Company');
  res.json({ company });
});

router.get('/:slug', async (req, res) => {
  const company = await CompanyModel.findOne({ slug: req.params.slug }).select(PUBLIC_FIELDS).lean();
  if (!company) throw notFound('Company');
  const internships = await InternshipModel.find({ ...openFilter(), companyId: company._id })
    .sort({ publishedAt: -1 })
    .lean();
  res.json({ company, internships: internships.map((i) => serializeInternship(i, company)) });
});

export default router;
