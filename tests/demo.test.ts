// Exercises the in-browser demo backend (GitHub Pages build) in Node, with browser storage stand-ins.
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';

const store = new Map<string, string>();
Object.assign(globalThis, {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
  },
});

const demo = await import('../web/src/demo/server.ts');
const { ApiError } = await import('../web/src/lib/api.ts');

const call = (method: string, path: string, body?: unknown, query?: Record<string, unknown>) => demo.handle(method, path, query, body) as Promise<any>;
const login = (email: string) => call('POST', '/auth/login', { email, password: 'Password123' });

async function expectStatus(p: Promise<unknown>, status: number) {
  const err = await p.then(() => null, (e) => e);
  expect(err, `expected ${status}`).toBeInstanceOf(ApiError);
  expect(err.status).toBe(status);
  return err;
}

beforeEach(async () => {
  await demo.resetDemo();
  store.clear();
});

describe('demo backend', () => {
  it('seeds data and searches like the real API', async () => {
    const all = await call('GET', '/internships');
    expect(all.total).toBe(14);
    expect(all.items[0].company.name).toBeTruthy();

    const ml = await call('GET', '/internships', undefined, { q: 'machine' });
    expect(ml.items.map((i: any) => i.title)).toEqual(['Machine Learning Intern (Computer Vision)']);

    const pay = await call('GET', '/internships', undefined, { sort: 'pay', limit: 2 });
    expect(pay.items[0].title).toBe('Remote Full-Stack Intern (Next.js)');

    const remote = await call('GET', '/internships', undefined, { mode: 'remote', paid: 'true' });
    expect(remote.items.every((i: any) => i.mode === 'remote' && i.paid)).toBe(true);

    const companies = await call('GET', '/companies');
    expect(companies.companies).toHaveLength(6);
  });

  it('logs in, keeps the session, and logs out', async () => {
    await expectStatus(call('POST', '/auth/login', { email: 'student@worknest.test', password: 'nope' }), 401);
    const s = await login('student@worknest.test');
    expect(s.user.role).toBe('student');
    expect((await demo.currentSession())?.user.name).toBe('Ayesha Khan');
    await call('POST', '/auth/logout');
    expect(await demo.currentSession()).toBeNull();
    await expectStatus(call('GET', '/applications/mine'), 401);
  });

  it('validates with the shared schemas', async () => {
    const err = await expectStatus(call('POST', '/auth/register', { role: 'student', name: 'A', email: 'x', password: 'short' }), 400);
    expect(Object.keys(err.fieldErrors)).toEqual(expect.arrayContaining(['name', 'email', 'password']));
  });

  it('runs the student → employer flow across both accounts', async () => {
    await login('student@worknest.test');
    const seeded = await call('GET', '/applications/mine');
    expect(seeded.items).toHaveLength(1);
    expect(await call('GET', '/conversations/unread-count')).toEqual({ count: 1 });

    const target = (await call('GET', '/internships', undefined, { q: 'frontend react' })).items[0];
    const detail = (await call('GET', `/internships/${target._id}`)).internship;
    await expectStatus(call('POST', `/applications/apply/${target._id}`, {}), 400); // required question
    const { application } = await call('POST', `/applications/apply/${target._id}`, {
      coverLetter: 'Hi',
      answers: detail.questions.map((q: any) => ({ questionId: q._id, answer: 'github.com/me' })),
    });
    await expectStatus(call('POST', `/applications/apply/${target._id}`, { answers: detail.questions.map((q: any) => ({ questionId: q._id, answer: 'again' })) }), 409);
    await call('POST', `/internships/${target._id}/save`);
    expect((await call('GET', '/internships/saved')).items).toHaveLength(1);

    await login('employer@worknest.test');
    const applicants = await call('GET', `/applications/internship/${target._id}`);
    expect(applicants.items[0].student.name).toBe('Ayesha Khan');
    expect(applicants.items[0].student.gpa).toBeUndefined(); // GPA shield
    expect((await call('GET', '/notifications')).unread).toBe(1);

    const blob = await demo.getResume(application.resume.fileId);
    expect(await blob.slice(0, 4).text()).toBe('%PDF');

    await call('PATCH', `/applications/${application._id}/status`, { status: 'interview', note: 'Tuesday 3pm?' });
    const { conversation } = await call('POST', '/conversations', { applicationId: application._id });
    await call('POST', `/conversations/${conversation._id}/messages`, { body: 'Looking forward to it' });
    await expectStatus(call('DELETE', `/internships/${target._id}`), 409);

    await login('student@worknest.test');
    expect((await call('GET', `/applications/${application._id}`)).application.status).toBe('interview');
    const thread = await call('GET', `/conversations/${conversation._id}/messages`);
    expect(thread.messages.map((m: any) => m.body)).toEqual(['Looking forward to it']);
  });

  it('blocks other companies from applicants and resumes', async () => {
    await login('hiring@northstar-studio.test');
    const ledgerlyRole = (await call('GET', '/internships', undefined, { company: 'ledgerly' })).items[0];
    await expectStatus(call('GET', `/applications/internship/${ledgerlyRole._id}`), 403);
    const fileId = (await (await login('student@worknest.test'), call('GET', '/profile/me'))).profile.resume.fileId;
    await login('hiring@northstar-studio.test');
    await expectStatus(demo.getResume(fileId), 403);
  });

  it('lets an employer post, and students find it', async () => {
    await call('POST', '/auth/register', { role: 'employer', name: 'Sana Iqbal', email: 'sana@new.test', password: 'Password123', companyName: 'New Co' });
    await expectStatus(call('POST', '/internships', { title: 'x' }), 400);
    await call('POST', '/internships', {
      title: 'Kotlin Android Intern',
      description: 'Build Android features in Kotlin with a small mobile team and ship them to real users weekly.',
      skills: ['Kotlin'],
      mode: 'remote',
      paid: true,
      payAmount: 500,
      payCurrency: 'USD',
      payPeriod: 'month',
      durationWeeks: 12,
    });
    const found = await call('GET', '/internships', undefined, { q: 'kotlin' });
    expect(found.items[0].company.name).toBe('New Co');
  });

  it('persists across reloads', async () => {
    await login('student@worknest.test');
    expect(store.get('worknest-demo')).toContain('Ayesha');
  });
});
