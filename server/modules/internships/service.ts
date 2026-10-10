import type { QueryFilter } from 'mongoose';
import type { InternshipInput } from '../../../shared/schemas.ts';
import { forbidden, notFound } from '../../lib/http.ts';
import type { AuthContext } from '../../middleware/auth.ts';
import { InternshipModel } from './model.ts';

// Rough conversion used only to rank by pay across currencies; never shown to users.
const PKR_PER_USD = 280;
const WEEKS_PER_MONTH = 4.33;

export function monthlyPkr(i: Pick<InternshipInput, 'paid' | 'payAmount' | 'payCurrency' | 'payPeriod' | 'durationWeeks'>) {
  if (!i.paid) return 0;
  const pkr = i.payCurrency === 'USD' ? i.payAmount * PKR_PER_USD : i.payAmount;
  if (i.payPeriod === 'week') return Math.round(pkr * WEEKS_PER_MONTH);
  if (i.payPeriod === 'total') return Math.round(pkr / Math.max(i.durationWeeks / WEEKS_PER_MONTH, 1));
  return pkr;
}

/** Internships students can currently see and apply to. */
export function openFilter(): QueryFilter<any> {
  return {
    status: 'open',
    $or: [{ deadline: { $exists: false } }, { deadline: null }, { deadline: { $gte: startOfToday() } }],
  };
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isAcceptingApplications(i: { status: string; deadline?: Date | null }) {
  return i.status === 'open' && (!i.deadline || new Date(i.deadline) >= startOfToday());
}

const COMPANY_FIELDS = ['_id', 'name', 'slug', 'logoUrl', 'city', 'industry', 'size', 'tagline', 'verified'] as const;

export function serializeInternship(i: any, company?: any) {
  const c = company ?? i.companyId;
  const { payMonthlyPkr: _p, viewCount: _v, postedBy: _b, companyId: _c, ...rest } = i;
  return {
    ...rest,
    companyId: String(c?._id ?? i.companyId),
    company: c && typeof c === 'object' ? Object.fromEntries(COMPANY_FIELDS.map((k) => [k, c[k]])) : null,
    acceptingApplications: isAcceptingApplications(i),
  };
}

/** Loads an internship and confirms the caller's company owns it. */
export async function ownedInternship(id: string, ctx: AuthContext) {
  const internship = await InternshipModel.findById(id);
  if (!internship) throw notFound('Internship');
  if (String(internship.companyId) !== ctx.companyId) throw forbidden();
  return internship;
}
