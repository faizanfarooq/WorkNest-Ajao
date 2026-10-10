/**
 * In-browser stand-in for the Express API, used only by the GitHub Pages demo build.
 * It answers the same routes with the same shapes, validates with the same Zod schemas,
 * and persists to localStorage (resumes in IndexedDB). Each visitor gets their own copy.
 */
import { z, type ZodType } from 'zod';
import {
  ApplicationStatusUpdateSchema,
  ApplySchema,
  ChangePasswordSchema,
  CompanySchema,
  InternshipQuerySchema,
  InternshipSchema,
  InternshipStatusSchema,
  LoginSchema,
  MessageSchema,
  RegisterSchema,
  StudentProfileSchema,
  type ApplicationStatus,
  type Role,
} from '@shared/schemas';
import { monthlyPkr } from '@shared/pay';
import {
  COMPANIES,
  DEMO_APPLICATION,
  DEMO_PASSWORD,
  DEMO_RESUME_PDF,
  DEMO_STUDENT,
  INTERNSHIPS,
  companySlug,
  employerEmail,
} from '@shared/seed-data';
import { ApiError } from '../lib/api';
import { clearFiles, deleteFile, getFile, putFile } from './files';

type Row = Record<string, any> & { _id: string };

interface DB {
  version: number;
  sessionUserId: string | null;
  users: Row[];
  companies: Row[];
  profiles: Row[];
  internships: Row[];
  applications: Row[];
  saved: Row[];
  conversations: Row[];
  messages: Row[];
  notifications: Row[];
}

const STORAGE_KEY = 'worknest-demo';
const VERSION = 1;
const DAY = 86_400_000;

const newId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 24);
const now = () => new Date().toISOString();
const daysFromNow = (d: number) => new Date(Date.now() + d * DAY).toISOString();
const clone = <T>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

async function hash(password: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`worknest-demo:${password}`));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------- Errors ----------

const fail = (status: number, message: string, details?: Record<string, string[]>) => new ApiError(status, message, details);
const badRequest = (m: string) => fail(400, m);
const unauthorized = (m = 'Please sign in to continue') => fail(401, m);
const forbidden = (m = 'You do not have access to this resource') => fail(403, m);
const notFound = (what = 'Resource') => fail(404, `${what} not found`);
const conflict = (m: string) => fail(409, m);

function parse<T>(schema: ZodType<T>, data: unknown): T {
  const r = schema.safeParse(data);
  if (!r.success) throw fail(400, 'Validation failed', z.flattenError(r.error).fieldErrors as Record<string, string[]>);
  return r.data;
}

// ---------- Storage ----------

let db: DB | null = null;
let loading: Promise<DB> | null = null;

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage full or blocked (private mode): the demo keeps working in memory for this tab.
  }
}

async function load(): Promise<DB> {
  if (db) return db;
  loading ??= (async () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (saved?.version === VERSION) return (db = saved as DB);
    } catch {
      // Corrupt or unavailable: fall through to a fresh seed.
    }
    db = await seed();
    persist();
    return db;
  })();
  return loading;
}

export async function resetDemo() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  await clearFiles().catch(() => {});
  db = null;
  loading = null;
}

async function seed(): Promise<DB> {
  const passwordHash = await hash(DEMO_PASSWORD);
  const d: DB = {
    version: VERSION,
    sessionUserId: null,
    users: [],
    companies: [],
    profiles: [],
    internships: [],
    applications: [],
    saved: [],
    conversations: [],
    messages: [],
    notifications: [],
  };

  COMPANIES.forEach((c, i) => {
    const slug = companySlug(c.name);
    const owner = { _id: newId(), name: `${c.name} Hiring`, email: employerEmail(i, slug), role: 'employer', passwordHash, createdAt: now() };
    const company = {
      _id: newId(),
      ...c,
      slug,
      website: `https://${slug}.example.com`,
      logoUrl: '',
      ownerId: owner._id,
      members: [owner._id],
      verified: i < 4,
      createdAt: daysFromNow(-90 + i * 7),
    };
    d.users.push({ ...owner, companyId: company._id });
    d.companies.push(company);
  });

  for (const s of INTERNSHIPS) {
    const company = d.companies[s.company];
    const pay = s.pay
      ? { paid: true, payAmount: s.pay[0], payCurrency: s.pay[1], payPeriod: s.pay[2] }
      : { paid: false, payAmount: 0, payCurrency: 'PKR' as const, payPeriod: 'month' as const };
    const publishedAt = daysFromNow(-s.daysAgo);
    d.internships.push({
      _id: newId(),
      companyId: company._id,
      postedBy: company.ownerId,
      title: s.title,
      description: `${s.summary}\n\nAbout the team: ${company.about}`,
      requirements: s.requirements,
      skills: s.skills,
      mode: s.mode,
      city: s.city ?? '',
      ...pay,
      payMonthlyPkr: monthlyPkr({ ...pay, durationWeeks: s.weeks }),
      durationWeeks: s.weeks,
      openings: 1 + (s.title.length % 3),
      deadline: s.deadlineInDays ? daysFromNow(s.deadlineInDays) : undefined,
      questions: (s.questions ?? []).map((prompt) => ({ _id: newId(), prompt, required: true })),
      status: 'open',
      publishedAt,
      createdAt: publishedAt,
      updatedAt: publishedAt,
      applicationCount: 0,
      viewCount: 20 + s.title.length * 3,
    });
  }

  const student = { _id: newId(), name: DEMO_STUDENT.name, email: DEMO_STUDENT.email, role: 'student', passwordHash, createdAt: now() };
  d.users.push(student);
  const resumeId = newId();
  const resumeBlob = new Blob([DEMO_RESUME_PDF], { type: 'application/pdf' });
  await putFile(resumeId, resumeBlob).catch(() => {});
  d.profiles.push({
    _id: newId(),
    userId: student._id,
    ...DEMO_STUDENT.profile,
    resume: { fileId: resumeId, fileName: DEMO_STUDENT.resumeFileName, size: resumeBlob.size, uploadedAt: now(), ownerId: student._id },
  });

  // One application in progress plus an opening message, so both sides have something to look at.
  const target = d.internships[DEMO_APPLICATION.internshipIndex];
  const company = d.companies.find((c) => c._id === target.companyId)!;
  const app = {
    _id: newId(),
    internshipId: target._id,
    companyId: target.companyId,
    studentId: student._id,
    status: 'reviewing',
    coverLetter: DEMO_APPLICATION.coverLetter,
    answers: [],
    resume: { fileId: resumeId, fileName: DEMO_STUDENT.resumeFileName },
    history: [
      { status: 'applied', at: daysFromNow(-2), by: student._id },
      { status: 'reviewing', at: daysFromNow(-1), by: company.ownerId },
    ],
    createdAt: daysFromNow(-2),
    updatedAt: daysFromNow(-1),
  };
  d.applications.push(app);
  target.applicationCount = 1;

  const body = `Hi ${DEMO_STUDENT.name.split(' ')[0]}, thanks for applying! Could you share a project where you designed a REST API?`;
  const convo = {
    _id: newId(),
    applicationId: app._id,
    internshipId: target._id,
    studentId: student._id,
    companyId: company._id,
    lastMessageAt: daysFromNow(-1),
    lastMessagePreview: body,
    unreadForStudent: 1,
    unreadForCompany: 0,
  };
  d.conversations.push(convo);
  d.messages.push({ _id: newId(), conversationId: convo._id, senderId: company.ownerId, side: 'company', body, createdAt: daysFromNow(-1) });
  d.notifications.push({
    _id: newId(),
    userId: student._id,
    title: `${target.title}: Under review`,
    body: '',
    link: `/applications/${app._id}`,
    createdAt: daysFromNow(-1),
  });

  return d;
}

// ---------- Session & lookups ----------

interface Session {
  user: Row;
  role: Role;
  companyId?: string;
}

function session(): Session {
  const user = db!.users.find((u) => u._id === db!.sessionUserId);
  if (!user) throw unauthorized();
  return { user, role: user.role, companyId: user.companyId };
}

function requireRole(role: Role): Session {
  const s = session();
  if (s.role !== role) throw forbidden();
  return s;
}

function publicUser(u: Row) {
  const c = u.companyId ? db!.companies.find((x) => x._id === u.companyId) : null;
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    company: c ? { id: c._id, name: c.name, slug: c.slug, logoUrl: c.logoUrl } : null,
  };
}

function startSession(u: Row) {
  db!.sessionUserId = u._id;
  return { accessToken: 'demo', user: publicUser(u) };
}

const find = (rows: Row[], id: string, what: string) => {
  const row = rows.find((r) => r._id === id);
  if (!row) throw notFound(what);
  return row;
};

function notify(userIds: string[], n: { title: string; body?: string; link?: string }) {
  for (const userId of userIds) db!.notifications.push({ _id: newId(), userId, body: '', link: '', ...n, createdAt: now() });
}

const COMPANY_FIELDS = ['_id', 'name', 'slug', 'logoUrl', 'city', 'industry', 'size', 'tagline', 'verified'] as const;
const companySummary = (c?: Row) => (c ? Object.fromEntries(COMPANY_FIELDS.map((k) => [k, c[k]])) : null);
const PUBLIC_COMPANY = [...COMPANY_FIELDS, 'about', 'website', 'createdAt'] as const;
const publicCompany = (c: Row): Record<string, any> => Object.fromEntries(PUBLIC_COMPANY.map((k) => [k, c[k]]));

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const accepting = (i: Row) => i.status === 'open' && (!i.deadline || new Date(i.deadline).getTime() >= startOfToday());

function serializeInternship(i: Row) {
  const { payMonthlyPkr: _p, viewCount: _v, postedBy: _b, ...rest } = i;
  return { ...rest, company: companySummary(db!.companies.find((c) => c._id === i.companyId)), acceptingApplications: accepting(i) };
}

function studentFlags(i: Row) {
  const s = db!.users.find((u) => u._id === db!.sessionUserId);
  if (s?.role !== 'student') return { saved: false, applicationId: null };
  return {
    saved: db!.saved.some((x) => x.userId === s._id && x.internshipId === i._id),
    applicationId: db!.applications.find((a) => a.studentId === s._id && a.internshipId === i._id)?._id ?? null,
  };
}

function applicantView(user: Row, profile?: Row) {
  const { gpa, hideGpa, resume: _r, userId: _u, ...rest } = (profile ?? {}) as Row;
  return { id: user._id, name: user.name, email: user.email, ...rest, gpa: hideGpa ? undefined : gpa };
}

function profileOf(userId: string) {
  let p = db!.profiles.find((x) => x.userId === userId);
  if (!p) {
    p = { _id: newId(), userId, headline: '', university: '', degree: '', city: '', bio: '', skills: [], hideGpa: true, links: {} };
    db!.profiles.push(p);
  }
  return p;
}

function loadProfile(userId: string) {
  const u = find(db!.users, userId, 'User');
  return { profile: { ...profileOf(userId), name: u.name, email: u.email } };
}

async function maybeDeleteResume(fileId?: string) {
  if (fileId && !db!.applications.some((a) => a.resume?.fileId === fileId)) await deleteFile(fileId).catch(() => {});
}

// ---------- Routing ----------

interface Ctx {
  params: Record<string, string>;
  query: Record<string, string>;
  body: any;
}
type Handler = (ctx: Ctx) => unknown | Promise<unknown>;
const routes: { method: string; re: RegExp; keys: string[]; handler: Handler }[] = [];

function route(method: string, pattern: string, handler: Handler) {
  const keys: string[] = [];
  const re = new RegExp(`^${pattern.replace(/:(\w+)/g, (_m, k) => (keys.push(k), '([^/]+)'))}$`);
  routes.push({ method, re, keys, handler });
}

export async function handle(method: string, path: string, query: Record<string, unknown> = {}, body?: unknown) {
  await load();
  // A small delay so loading states look like the real thing.
  await new Promise((r) => setTimeout(r, 120 + Math.random() * 120));
  for (const r of routes) {
    if (r.method !== method) continue;
    const m = path.match(r.re);
    if (!m) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    const q = Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]));
    // FormData (resume uploads) passes through as-is; JSON bodies are copied like a real request would be.
    const payload = body instanceof FormData ? body : (clone(body) ?? {});
    const result = await r.handler({ params, query: q, body: payload });
    if (method !== 'GET') persist();
    return clone(result);
  }
  throw notFound('Endpoint');
}

export async function currentSession() {
  await load();
  const u = db!.users.find((x) => x._id === db!.sessionUserId);
  return u ? { accessToken: 'demo', user: publicUser(u) } : null;
}

/** Resume download with the same access rule as the server. */
export async function getResume(fileId: string) {
  await load();
  const s = session();
  const ownerProfile = db!.profiles.find((p) => p.resume?.fileId === fileId);
  const app = db!.applications.find((a) => a.resume?.fileId === fileId);
  const ownerId = ownerProfile?.userId ?? app?.studentId;
  const allowed = ownerId === s.user._id || (s.role === 'employer' && db!.applications.some((a) => a.companyId === s.companyId && a.resume?.fileId === fileId));
  if (!allowed) throw forbidden();
  const blob = await getFile(fileId);
  if (!blob) throw notFound('File');
  return blob;
}

// ---------- Auth ----------

route('POST', '/auth/register', async ({ body }) => {
  const input = parse(RegisterSchema, body);
  if (db!.users.some((u) => u.email === input.email)) throw conflict('An account with this email already exists');
  const user: Row = { _id: newId(), name: input.name, email: input.email, role: input.role, passwordHash: await hash(input.password), createdAt: now() };
  if (input.role === 'employer') {
    let slug = companySlug(input.companyName) || 'company';
    for (let n = 2; db!.companies.some((c) => c.slug === slug); n++) slug = `${companySlug(input.companyName)}-${n}`;
    const company = { _id: newId(), name: input.companyName, slug, tagline: '', about: '', website: '', logoUrl: '', city: '', industry: '', size: '1-10', ownerId: user._id, members: [user._id], verified: false, createdAt: now() };
    db!.companies.push(company);
    user.companyId = company._id;
  } else {
    profileOf(user._id);
  }
  db!.users.push(user);
  return startSession(user);
});

route('POST', '/auth/login', async ({ body }) => {
  const { email, password } = parse(LoginSchema, body);
  const user = db!.users.find((u) => u.email === email);
  if (!user || user.passwordHash !== (await hash(password))) throw unauthorized('Incorrect email or password');
  return startSession(user);
});

route('POST', '/auth/refresh', () => {
  const user = db!.users.find((u) => u._id === db!.sessionUserId);
  if (!user) throw unauthorized('No active session');
  return { accessToken: 'demo', user: publicUser(user) };
});

route('POST', '/auth/logout', () => {
  db!.sessionUserId = null;
});

route('GET', '/auth/me', () => ({ user: publicUser(session().user) }));

route('POST', '/auth/forgot-password', () => {
  throw badRequest("The demo doesn't send emails. Use a demo account, or create a new one.");
});

route('POST', '/auth/reset-password', () => {
  throw badRequest("Password reset isn't available in the demo.");
});

route('POST', '/auth/change-password', async ({ body }) => {
  const { user } = session();
  const input = parse(ChangePasswordSchema, body);
  if (user.passwordHash !== (await hash(input.currentPassword))) throw badRequest('Current password is incorrect');
  user.passwordHash = await hash(input.newPassword);
  return startSession(user);
});

// ---------- Profile ----------

route('GET', '/profile/me', () => loadProfile(requireRole('student').user._id));

route('PUT', '/profile/me', ({ body }) => {
  const { user } = requireRole('student');
  const { name, ...rest } = parse(StudentProfileSchema, body);
  user.name = name;
  const p = profileOf(user._id);
  Object.assign(p, rest);
  if (rest.gpa === undefined) delete p.gpa;
  return loadProfile(user._id);
});

route('POST', '/profile/me/resume', async ({ body }) => {
  const { user } = requireRole('student');
  const file = body instanceof FormData ? body.get('resume') : null;
  if (!(file instanceof File)) throw badRequest('Attach a PDF file named "resume"');
  if (file.size > 2 * 1024 * 1024) throw badRequest('File too large');
  if ((await file.slice(0, 4).text()) !== '%PDF') throw badRequest('Resume must be a PDF');
  const fileId = newId();
  await putFile(fileId, file);
  const p = profileOf(user._id);
  const old = p.resume?.fileId;
  p.resume = { fileId, fileName: file.name.replace(/[^\w.\- ]+/g, '_').slice(0, 100) || 'resume.pdf', size: file.size, uploadedAt: now() };
  await maybeDeleteResume(old);
  return loadProfile(user._id);
});

route('DELETE', '/profile/me/resume', async () => {
  const { user } = requireRole('student');
  const p = profileOf(user._id);
  const old = p.resume?.fileId;
  delete p.resume;
  await maybeDeleteResume(old);
  return loadProfile(user._id);
});

// ---------- Companies ----------

route('GET', '/companies', ({ query }) => {
  const q = query.q?.toLowerCase();
  const companies = db!.companies
    .filter((c) => !q || c.name.toLowerCase().includes(q))
    .map((c) => ({ ...publicCompany(c), name: c.name as string, openRoles: db!.internships.filter((i) => i.companyId === c._id && accepting(i)).length }))
    .sort((a, b) => b.openRoles - a.openRoles || a.name.localeCompare(b.name));
  return { companies };
});

route('GET', '/companies/mine', () => ({ company: find(db!.companies, requireRole('employer').companyId!, 'Company') }));

route('PUT', '/companies/mine', ({ body }) => {
  const company = find(db!.companies, requireRole('employer').companyId!, 'Company');
  Object.assign(company, parse(CompanySchema, body));
  return { company };
});

route('GET', '/companies/:slug', ({ params }) => {
  const company = db!.companies.find((c) => c.slug === params.slug);
  if (!company) throw notFound('Company');
  const internships = db!.internships
    .filter((i) => i.companyId === company._id && accepting(i))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map(serializeInternship);
  return { company: publicCompany(company), internships };
});

// ---------- Internships ----------

function textScore(i: Row, terms: string[]) {
  const title = i.title.toLowerCase();
  const skills = i.skills.join(' ').toLowerCase();
  const desc = i.description.toLowerCase();
  return terms.reduce((n, t) => n + (title.includes(t) ? 10 : 0) + (skills.includes(t) ? 5 : 0) + (desc.includes(t) ? 1 : 0), 0);
}

route('GET', '/internships', ({ query }) => {
  const q = parse(InternshipQuerySchema, query);
  const terms = (q.q ?? '').toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  const companyId = q.company ? (db!.companies.find((c) => c.slug === q.company)?._id ?? '-') : null;

  let items = db!.internships
    .filter(accepting)
    .filter((i) => !q.city || i.city.toLowerCase() === q.city.toLowerCase())
    .filter((i) => !q.mode || i.mode === q.mode)
    .filter((i) => !q.paid || i.paid === (q.paid === 'true'))
    .filter((i) => !q.skill || i.skills.some((s: string) => s.toLowerCase() === q.skill!.toLowerCase()))
    .filter((i) => !companyId || i.companyId === companyId)
    .map((i) => ({ i, score: terms.length ? textScore(i, terms) : 0 }))
    .filter(({ score }) => !terms.length || score > 0);

  const byDate = (a: Row, b: Row) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');
  items.sort((a, b) =>
    q.sort === 'pay'
      ? b.i.payMonthlyPkr - a.i.payMonthlyPkr || byDate(a.i, b.i)
      : q.sort === 'deadline'
        ? (a.i.deadline ?? '9999').localeCompare(b.i.deadline ?? '9999') || byDate(a.i, b.i)
        : terms.length
          ? b.score - a.score || byDate(a.i, b.i)
          : byDate(a.i, b.i),
  );

  const total = items.length;
  items = items.slice((q.page - 1) * q.limit, q.page * q.limit);
  return {
    items: items.map(({ i }) => ({ ...serializeInternship(i), ...studentFlags(i) })),
    total,
    page: q.page,
    pages: Math.max(Math.ceil(total / q.limit), 1),
  };
});

route('GET', '/internships/popular-skills', () => {
  const counts = new Map<string, { name: string; count: number }>();
  for (const i of db!.internships.filter(accepting)) {
    for (const s of i.skills as string[]) {
      const k = s.toLowerCase();
      counts.set(k, { name: counts.get(k)?.name ?? s, count: (counts.get(k)?.count ?? 0) + 1 });
    }
  }
  return { skills: [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 16) };
});

route('GET', '/internships/stats', () => ({
  openRoles: db!.internships.filter(accepting).length,
  companies: db!.companies.length,
  applications: db!.applications.length,
}));

route('GET', '/internships/saved', () => {
  const { user } = requireRole('student');
  const items = db!.saved
    .filter((s) => s.userId === user._id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((s) => db!.internships.find((i) => i._id === s.internshipId))
    .filter(Boolean)
    .map((i) => ({ ...serializeInternship(i!), ...studentFlags(i!), saved: true }));
  return { items };
});

route('POST', '/internships/:id/save', ({ params }) => {
  const { user } = requireRole('student');
  find(db!.internships, params.id, 'Internship');
  if (!db!.saved.some((s) => s.userId === user._id && s.internshipId === params.id)) {
    db!.saved.push({ _id: newId(), userId: user._id, internshipId: params.id, createdAt: now() });
  }
});

route('DELETE', '/internships/:id/save', ({ params }) => {
  const { user } = requireRole('student');
  db!.saved = db!.saved.filter((s) => !(s.userId === user._id && s.internshipId === params.id));
});

route('GET', '/internships/mine', () => {
  const { companyId } = requireRole('employer');
  const items = db!.internships
    .filter((i) => i.companyId === companyId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((i) => {
      const statusCounts: Record<string, number> = {};
      for (const a of db!.applications.filter((x) => x.internshipId === i._id)) statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1;
      return { ...serializeInternship(i), viewCount: i.viewCount, statusCounts };
    });
  return { items };
});

function owned(id: string) {
  const s = requireRole('employer');
  const i = find(db!.internships, id, 'Internship');
  if (i.companyId !== s.companyId) throw forbidden();
  return { i, s };
}

const toStored = (input: z.infer<typeof InternshipSchema>) => ({
  ...input,
  deadline: input.deadline ? new Date(input.deadline).toISOString() : undefined,
  questions: input.questions.map((q) => ({ ...q, _id: q._id ?? newId() })),
  payMonthlyPkr: monthlyPkr(input),
});

route('POST', '/internships', ({ body }) => {
  const s = requireRole('employer');
  const input = parse(InternshipSchema, body);
  const i = {
    _id: newId(),
    ...toStored(input),
    companyId: s.companyId,
    postedBy: s.user._id,
    publishedAt: input.status === 'open' ? now() : undefined,
    createdAt: now(),
    updatedAt: now(),
    applicationCount: 0,
    viewCount: 0,
  };
  db!.internships.push(i);
  return { internship: serializeInternship(i) };
});

route('PUT', '/internships/:id', ({ params, body }) => {
  const { i } = owned(params.id);
  const input = parse(InternshipSchema, body);
  const status = i.status === 'closed' ? 'closed' : input.status;
  Object.assign(i, toStored(input), { status, updatedAt: now() });
  if (input.deadline === undefined) delete i.deadline;
  if (status === 'open' && !i.publishedAt) i.publishedAt = now();
  return { internship: serializeInternship(i) };
});

route('PATCH', '/internships/:id/status', ({ params, body }) => {
  const { i } = owned(params.id);
  i.status = parse(InternshipStatusSchema, body).status;
  if (i.status === 'open' && !i.publishedAt) i.publishedAt = now();
  return { internship: serializeInternship(i) };
});

route('DELETE', '/internships/:id', ({ params }) => {
  const { i } = owned(params.id);
  if (db!.applications.some((a) => a.internshipId === i._id)) throw conflict('This posting has applicants. Close it instead of deleting it.');
  db!.internships = db!.internships.filter((x) => x._id !== i._id);
  db!.saved = db!.saved.filter((x) => x.internshipId !== i._id);
});

route('GET', '/internships/:id', ({ params }) => {
  const i = find(db!.internships, params.id, 'Internship');
  const me = db!.users.find((u) => u._id === db!.sessionUserId);
  const isOwner = !!me?.companyId && me.companyId === i.companyId;
  if (i.status === 'draft' && !isOwner) throw notFound('Internship');
  if (!isOwner) i.viewCount = (i.viewCount ?? 0) + 1;
  persist();
  return { internship: { ...serializeInternship(i), ...studentFlags(i), isOwner } };
});

// ---------- Applications ----------

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  reviewing: 'Under review',
  interview: 'Interview',
  offered: 'Offer extended',
  hired: 'Hired',
  rejected: 'Not selected',
  withdrawn: 'Withdrawn',
};
const FINAL: ApplicationStatus[] = ['hired', 'rejected', 'withdrawn'];

function withInternship(a: Row) {
  const i = db!.internships.find((x) => x._id === a.internshipId);
  return { ...a, internship: i ? { ...i, company: companySummary(db!.companies.find((c) => c._id === i.companyId)) } : null };
}

route('POST', '/applications/apply/:internshipId', ({ params, body }) => {
  const { user } = requireRole('student');
  const input = parse(ApplySchema, body);
  const i = find(db!.internships, params.internshipId, 'Internship');
  if (i.status === 'draft') throw notFound('Internship');
  if (!accepting(i)) throw badRequest('This internship is no longer accepting applications');
  const profile = profileOf(user._id);
  if (!profile.resume?.fileId) throw badRequest('Upload your resume on your profile before applying');

  const answers = (i.questions as Row[]).map((q) => {
    const answer = input.answers.find((a) => a.questionId === q._id)?.answer.trim() ?? '';
    if (q.required && !answer) throw badRequest(`Please answer: "${q.prompt}"`);
    return { questionId: q._id, prompt: q.prompt, answer };
  });
  if (db!.applications.some((a) => a.internshipId === i._id && a.studentId === user._id)) throw conflict('You have already applied to this internship');

  const application = {
    _id: newId(),
    internshipId: i._id,
    companyId: i.companyId,
    studentId: user._id,
    status: 'applied',
    coverLetter: input.coverLetter,
    answers,
    resume: { fileId: profile.resume.fileId, fileName: profile.resume.fileName },
    history: [{ status: 'applied', at: now(), by: user._id }],
    createdAt: now(),
    updatedAt: now(),
  };
  db!.applications.push(application);
  i.applicationCount = (i.applicationCount ?? 0) + 1;
  const company = db!.companies.find((c) => c._id === i.companyId);
  notify(company?.members ?? [], {
    title: `New applicant for ${i.title}`,
    body: `${user.name} applied.`,
    link: `/employer/internships/${i._id}/applicants?app=${application._id}`,
  });
  return { application };
});

route('GET', '/applications/mine', () => {
  const { user } = requireRole('student');
  const items = db!.applications
    .filter((a) => a.studentId === user._id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(withInternship);
  return { items };
});

route('GET', '/applications/internship/:internshipId', ({ params, query }) => {
  const { i } = owned(params.internshipId);
  const items = db!.applications
    .filter((a) => a.internshipId === i._id && (!query.status || a.status === query.status))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((a) => {
      const u = db!.users.find((x) => x._id === a.studentId);
      return { ...a, student: u ? applicantView(u, db!.profiles.find((p) => p.userId === u._id)) : null };
    });
  return { internship: { _id: i._id, title: i.title, status: i.status, questions: i.questions }, items };
});

route('GET', '/applications/:id', ({ params }) => {
  const s = session();
  const a = find(db!.applications, params.id, 'Application');
  const isStudent = s.role === 'student' && a.studentId === s.user._id;
  const isEmployer = s.role === 'employer' && a.companyId === s.companyId;
  if (!isStudent && !isEmployer) throw forbidden();
  const u = db!.users.find((x) => x._id === a.studentId);
  return {
    application: {
      ...withInternship(a),
      student: isEmployer && u ? applicantView(u, db!.profiles.find((p) => p.userId === u._id)) : null,
      conversationId: db!.conversations.find((c) => c.applicationId === a._id)?._id ?? null,
    },
  };
});

route('POST', '/applications/:id/withdraw', ({ params }) => {
  const { user } = requireRole('student');
  const a = find(db!.applications, params.id, 'Application');
  if (a.studentId !== user._id) throw notFound('Application');
  if (FINAL.includes(a.status)) throw badRequest('This application can no longer be withdrawn');
  a.status = 'withdrawn';
  a.history.push({ status: 'withdrawn', at: now(), by: user._id });
  a.updatedAt = now();
  return { application: a };
});

route('PATCH', '/applications/:id/status', ({ params, body }) => {
  const s = requireRole('employer');
  const a = find(db!.applications, params.id, 'Application');
  if (a.companyId !== s.companyId) throw notFound('Application');
  if (a.status === 'withdrawn') throw badRequest('The student withdrew this application');
  const { status, note } = parse(ApplicationStatusUpdateSchema, body);
  if (a.status !== status) {
    a.status = status;
    a.history.push({ status, at: now(), by: s.user._id, note });
    a.updatedAt = now();
    const i = db!.internships.find((x) => x._id === a.internshipId);
    notify([a.studentId], { title: `${i?.title ?? 'Your application'}: ${STATUS_LABEL[status]}`, body: note ?? '', link: `/applications/${a._id}` });
  }
  return { application: a };
});

// ---------- Conversations ----------

type Side = 'student' | 'company';

function sideOf(c: Row, s: Session): Side {
  if (s.role === 'student' && c.studentId === s.user._id) return 'student';
  if (s.role === 'employer' && c.companyId === s.companyId) return 'company';
  throw forbidden();
}

function serializeConvo(c: Row, side: Side) {
  const i = db!.internships.find((x) => x._id === c.internshipId);
  const u = db!.users.find((x) => x._id === c.studentId);
  return {
    _id: c._id,
    applicationId: c.applicationId,
    internship: i ? { _id: i._id, title: i.title } : null,
    student: u ? { _id: u._id, name: u.name } : null,
    company: companySummary(db!.companies.find((x) => x._id === c.companyId)),
    lastMessageAt: c.lastMessageAt,
    lastMessagePreview: c.lastMessagePreview,
    unread: side === 'student' ? c.unreadForStudent : c.unreadForCompany,
  };
}

const mine = (s: Session) => db!.conversations.filter((c) => (s.role === 'student' ? c.studentId === s.user._id : c.companyId === s.companyId));

route('GET', '/conversations', () => {
  const s = session();
  const side: Side = s.role === 'student' ? 'student' : 'company';
  return { items: mine(s).sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)).map((c) => serializeConvo(c, side)) };
});

route('GET', '/conversations/unread-count', () => {
  const s = session();
  return { count: mine(s).reduce((n, c) => n + (s.role === 'student' ? c.unreadForStudent : c.unreadForCompany), 0) };
});

route('POST', '/conversations', ({ body }) => {
  const s = requireRole('employer');
  const a = find(db!.applications, String(body?.applicationId ?? ''), 'Application');
  if (a.companyId !== s.companyId) throw notFound('Application');
  let c = db!.conversations.find((x) => x.applicationId === a._id);
  if (!c) {
    c = { _id: newId(), applicationId: a._id, internshipId: a.internshipId, studentId: a.studentId, companyId: a.companyId, lastMessageAt: now(), lastMessagePreview: '', unreadForStudent: 0, unreadForCompany: 0 };
    db!.conversations.push(c);
  }
  return { conversation: serializeConvo(c, 'company') };
});

route('GET', '/conversations/:id/messages', ({ params, query }) => {
  const s = session();
  const c = find(db!.conversations, params.id, 'Conversation');
  const side = sideOf(c, s);
  const after = query.after ? new Date(query.after).getTime() : 0;
  const messages = db!.messages
    .filter((m) => m.conversationId === c._id && new Date(m.createdAt).getTime() > after)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const field = side === 'student' ? 'unreadForStudent' : 'unreadForCompany';
  if (c[field] > 0) {
    c[field] = 0;
    persist();
  }
  return { conversation: serializeConvo(c, side), side, messages };
});

route('POST', '/conversations/:id/messages', ({ params, body }) => {
  const s = session();
  const c = find(db!.conversations, params.id, 'Conversation');
  const side = sideOf(c, s);
  const { body: text } = parse(MessageSchema, body);
  const message = { _id: newId(), conversationId: c._id, senderId: s.user._id, side, body: text, createdAt: now() };
  db!.messages.push(message);
  const other = side === 'student' ? 'unreadForCompany' : 'unreadForStudent';
  const wasZero = c[other] === 0;
  Object.assign(c, { lastMessageAt: message.createdAt, lastMessagePreview: text.slice(0, 140), [other]: c[other] + 1 });
  if (wasZero) {
    const recipients = side === 'student' ? (db!.companies.find((x) => x._id === c.companyId)?.members ?? []) : [c.studentId];
    notify(recipients, { title: 'New message', body: text.slice(0, 100), link: `/messages/${c._id}` });
  }
  return { message };
});

// ---------- Notifications ----------

route('GET', '/notifications', () => {
  const { user } = session();
  const all = db!.notifications.filter((n) => n.userId === user._id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { items: all.slice(0, 30), unread: all.filter((n) => !n.readAt).length };
});

route('POST', '/notifications/read-all', () => {
  const { user } = session();
  for (const n of db!.notifications) if (n.userId === user._id && !n.readAt) n.readAt = now();
});
