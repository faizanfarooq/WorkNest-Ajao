import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Express } from 'express';

let mongo: MongoMemoryServer;
let app: Express;

const PDF = Buffer.from('%PDF-1.4\n%test\n%%EOF\n');

beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 120_000 } });
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongo.getUri('worknest-test');
  process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-chars';
  const { connectDB } = await import('../server/db.ts');
  const { createApp } = await import('../server/app.ts');
  await connectDB();
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
  app = createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

beforeEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
});

async function register(body: Record<string, string>) {
  const res = await request(app).post('/api/auth/register').send({ password: 'Password123', ...body });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return { token: res.body.accessToken as string, user: res.body.user, cookie: res.headers['set-cookie'] as unknown as string[] };
}

const student = (email = 'sara@uni.test') => register({ role: 'student', name: 'Sara Ali', email });
const employer = (email = 'hr@acme.test', companyName = 'Acme Labs') =>
  register({ role: 'employer', name: 'Hamza HR', email, companyName });

const internshipBody = {
  title: 'Frontend Intern',
  description: 'Build user interfaces in React with a small product team and ship features weekly to real users.',
  requirements: ['React basics'],
  skills: ['React', 'TypeScript'],
  city: 'Lahore',
  mode: 'hybrid',
  paid: true,
  payAmount: 40000,
  payCurrency: 'PKR',
  payPeriod: 'month',
  durationWeeks: 12,
  questions: [{ prompt: 'Link your GitHub', required: true }],
  status: 'open',
};

async function postInternship(token: string, overrides: Record<string, unknown> = {}) {
  const res = await request(app)
    .post('/api/internships')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...internshipBody, ...overrides });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return res.body.internship;
}

describe('auth', () => {
  it('registers, rejects duplicates, logs in and reads /me', async () => {
    const { token, user } = await student();
    expect(user).toMatchObject({ role: 'student', email: 'sara@uni.test' });
    expect(user.passwordHash).toBeUndefined();

    const dup = await request(app).post('/api/auth/register').send({ role: 'student', name: 'X Y', email: 'sara@uni.test', password: 'Password123' });
    expect(dup.status).toBe(409);

    const bad = await request(app).post('/api/auth/login').send({ email: 'sara@uni.test', password: 'wrong-pass1' });
    expect(bad.status).toBe(401);

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.body.user.name).toBe('Sara Ali');
  });

  it('validates input with field errors', async () => {
    const res = await request(app).post('/api/auth/register').send({ role: 'student', name: 'A', email: 'nope', password: 'short' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.details)).toEqual(expect.arrayContaining(['name', 'email', 'password']));
  });

  it('creates a company for employers', async () => {
    const { user } = await employer();
    expect(user.company).toMatchObject({ name: 'Acme Labs', slug: 'acme-labs' });
    const second = await employer('hr2@acme.test', 'Acme Labs');
    expect(second.user.company.slug).toBe('acme-labs-2');
  });

  it('rotates refresh tokens and rejects reuse', async () => {
    const { cookie } = await student();
    const first = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(first.status).toBe(200);
    expect(first.body.accessToken).toBeTruthy();

    const replay = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(replay.status).toBe(401);

    const next = await request(app).post('/api/auth/refresh').set('Cookie', first.headers['set-cookie']);
    expect(next.status).toBe(200);
  });

  it('logout invalidates the refresh token', async () => {
    const { cookie } = await student();
    await request(app).post('/api/auth/logout').set('Cookie', cookie).expect(204);
    await request(app).post('/api/auth/refresh').set('Cookie', cookie).expect(401);
  });

  it('resets a password with a valid token', async () => {
    const crypto = await import('node:crypto');
    await student();
    await request(app).post('/api/auth/forgot-password').send({ email: 'sara@uni.test' }).expect(200);
    await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@uni.test' }).expect(200);

    // Plant a known token, since the real one is only emailed.
    const token = 'known-reset-token-123';
    await mongoose.connection.collection('users').updateOne(
      { email: 'sara@uni.test' },
      { $set: { passwordResetHash: crypto.createHash('sha256').update(token).digest('hex'), passwordResetExpires: new Date(Date.now() + 60_000) } },
    );
    await request(app).post('/api/auth/reset-password').send({ token, password: 'NewPassword9' }).expect(200);
    await request(app).post('/api/auth/reset-password').send({ token, password: 'NewPassword9' }).expect(400);
    await request(app).post('/api/auth/login').send({ email: 'sara@uni.test', password: 'NewPassword9' }).expect(200);
  });
});

describe('internships', () => {
  it('only employers can post, and validation applies', async () => {
    const s = await student();
    await request(app).post('/api/internships').set('Authorization', `Bearer ${s.token}`).send(internshipBody).expect(403);
    await request(app).post('/api/internships').send(internshipBody).expect(401);

    const e = await employer();
    const res = await request(app)
      .post('/api/internships')
      .set('Authorization', `Bearer ${e.token}`)
      .send({ ...internshipBody, mode: 'onsite', city: '', paid: true, payAmount: 0 });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('city');
    expect(res.body.details).toHaveProperty('payAmount');
  });

  it('searches, filters and hides drafts', async () => {
    const e = await employer();
    await postInternship(e.token);
    await postInternship(e.token, { title: 'Data Analyst Intern', skills: ['SQL'], mode: 'remote', city: '', paid: false });
    await postInternship(e.token, { title: 'Secret Draft Role', status: 'draft' });

    const all = await request(app).get('/api/internships');
    expect(all.body.total).toBe(2);

    const search = await request(app).get('/api/internships').query({ q: 'analyst' });
    expect(search.body.items.map((i: any) => i.title)).toEqual(['Data Analyst Intern']);

    const remote = await request(app).get('/api/internships').query({ mode: 'remote' });
    expect(remote.body.total).toBe(1);

    const paid = await request(app).get('/api/internships').query({ paid: 'true', skill: 'react' });
    expect(paid.body.items[0].title).toBe('Frontend Intern');
    expect(paid.body.items[0].company.name).toBe('Acme Labs');

    const mine = await request(app).get('/api/internships/mine').set('Authorization', `Bearer ${e.token}`);
    expect(mine.body.items).toHaveLength(3);
  });

  it("stops other companies from editing a posting", async () => {
    const owner = await employer();
    const other = await employer('hr@other.test', 'Other Co');
    const internship = await postInternship(owner.token);
    await request(app)
      .patch(`/api/internships/${internship._id}/status`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ status: 'closed' })
      .expect(403);
  });

  it('saves and unsaves', async () => {
    const e = await employer();
    const internship = await postInternship(e.token);
    const s = await student();
    await request(app).post(`/api/internships/${internship._id}/save`).set('Authorization', `Bearer ${s.token}`).expect(204);
    const saved = await request(app).get('/api/internships/saved').set('Authorization', `Bearer ${s.token}`);
    expect(saved.body.items).toHaveLength(1);
    const detail = await request(app).get(`/api/internships/${internship._id}`).set('Authorization', `Bearer ${s.token}`);
    expect(detail.body.internship.saved).toBe(true);
    await request(app).delete(`/api/internships/${internship._id}/save`).set('Authorization', `Bearer ${s.token}`).expect(204);
  });
});

describe('applications', () => {
  it('runs the full apply → review → message flow', async () => {
    const e = await employer();
    const internship = await postInternship(e.token);
    const s = await student();
    const authS = { Authorization: `Bearer ${s.token}` };
    const authE = { Authorization: `Bearer ${e.token}` };

    // Needs a resume first.
    const noResume = await request(app).post(`/api/applications/apply/${internship._id}`).set(authS).send({});
    expect(noResume.status).toBe(400);

    await request(app).post('/api/profile/me/resume').set(authS).attach('resume', Buffer.from('not a pdf'), 'cv.pdf').expect(400);
    await request(app).post('/api/profile/me/resume').set(authS).attach('resume', PDF, 'cv.pdf').expect(200);

    // Required question must be answered.
    const missing = await request(app).post(`/api/applications/apply/${internship._id}`).set(authS).send({ coverLetter: 'Hi' });
    expect(missing.status).toBe(400);

    const questionId = internship.questions[0]._id;
    const applied = await request(app)
      .post(`/api/applications/apply/${internship._id}`)
      .set(authS)
      .send({ coverLetter: 'Hi', answers: [{ questionId, answer: 'github.com/sara' }] });
    expect(applied.status).toBe(201);
    const appId = applied.body.application._id;

    await request(app)
      .post(`/api/applications/apply/${internship._id}`)
      .set(authS)
      .send({ answers: [{ questionId, answer: 'again' }] })
      .expect(409);

    // Employer sees the applicant and got notified.
    const list = await request(app).get(`/api/applications/internship/${internship._id}`).set(authE);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0].student.name).toBe('Sara Ali');
    const employerNotes = await request(app).get('/api/notifications').set(authE);
    expect(employerNotes.body.unread).toBe(1);

    // Employer can open the resume; a stranger cannot.
    const fileId = applied.body.application.resume.fileId;
    await request(app).get(`/api/profile/resumes/${fileId}`).set(authE).expect(200);
    const stranger = await employer('x@else.test', 'Elsewhere');
    await request(app).get(`/api/profile/resumes/${fileId}`).set('Authorization', `Bearer ${stranger.token}`).expect(403);
    await request(app).get(`/api/applications/${appId}`).set('Authorization', `Bearer ${stranger.token}`).expect(403);

    // Status change notifies the student.
    await request(app).patch(`/api/applications/${appId}/status`).set(authE).send({ status: 'interview', note: 'Pick a slot' }).expect(200);
    const mine = await request(app).get('/api/applications/mine').set(authS);
    expect(mine.body.items[0].status).toBe('interview');
    expect(mine.body.items[0].internship.title).toBe('Frontend Intern');

    // Messaging: employer opens, student replies, unread counts move.
    const convo = await request(app).post('/api/conversations').set(authE).send({ applicationId: appId });
    expect(convo.status).toBe(201);
    const convoId = convo.body.conversation._id;
    await request(app).post(`/api/conversations/${convoId}/messages`).set(authS).send({ body: 'Hello!' }).expect(201);
    const unread = await request(app).get('/api/conversations/unread-count').set(authE);
    expect(unread.body.count).toBe(1);
    const thread = await request(app).get(`/api/conversations/${convoId}/messages`).set(authE);
    expect(thread.body.messages).toHaveLength(1);
    const after = await request(app).get('/api/conversations/unread-count').set(authE);
    expect(after.body.count).toBe(0);
    await request(app)
      .get(`/api/conversations/${convoId}/messages`)
      .set('Authorization', `Bearer ${stranger.token}`)
      .expect(403);

    // Withdraw locks it from further employer moves.
    await request(app).post(`/api/applications/${appId}/withdraw`).set(authS).expect(200);
    await request(app).patch(`/api/applications/${appId}/status`).set(authE).send({ status: 'hired' }).expect(400);

    // A posting with applicants can be closed but not deleted.
    await request(app).delete(`/api/internships/${internship._id}`).set(authE).expect(409);
  });

  it('hides GPA from employers when the shield is on', async () => {
    const e = await employer();
    const internship = await postInternship(e.token, { questions: [] });
    const s = await student();
    const authS = { Authorization: `Bearer ${s.token}` };
    await request(app)
      .put('/api/profile/me')
      .set(authS)
      .send({ name: 'Sara Ali', gpa: 2.6, hideGpa: true, skills: ['React', 'react'] })
      .expect(200);
    await request(app).post('/api/profile/me/resume').set(authS).attach('resume', PDF, 'cv.pdf').expect(200);
    const applied = await request(app).post(`/api/applications/apply/${internship._id}`).set(authS).send({});
    const view = await request(app).get(`/api/applications/${applied.body.application._id}`).set('Authorization', `Bearer ${e.token}`);
    expect(view.body.application.student.gpa).toBeUndefined();
    expect(view.body.application.student.skills).toEqual(['react']);
  });

  it('rejects applications to closed postings', async () => {
    const e = await employer();
    const internship = await postInternship(e.token, { questions: [] });
    await request(app).patch(`/api/internships/${internship._id}/status`).set('Authorization', `Bearer ${e.token}`).send({ status: 'closed' }).expect(200);
    const s = await student();
    const res = await request(app).post(`/api/applications/apply/${internship._id}`).set('Authorization', `Bearer ${s.token}`).send({});
    expect(res.status).toBe(400);
  });
});
