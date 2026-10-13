import { Router } from 'express';
import { z } from 'zod';
import {
  APPLICATION_STATUSES,
  ApplicationStatusUpdateSchema,
  ApplySchema,
  type ApplicationStatus,
  type ApplyInput,
} from '../../../shared/schemas.ts';
import { assertObjectId, badRequest, conflict, forbidden, notFound, validate } from '../../lib/http.ts';
import { assertEmailVerified, auth, requireAuth, requireRole } from '../../middleware/auth.ts';
import { UserModel } from '../auth/models.ts';
import { CompanyModel } from '../companies/model.ts';
import { InternshipModel } from '../internships/model.ts';
import { isAcceptingApplications, ownedInternship } from '../internships/service.ts';
import { ConversationModel } from '../messages/model.ts';
import { notify } from '../notifications/model.ts';
import { StudentProfileModel } from '../profiles/model.ts';
import { ApplicationModel } from './model.ts';

const router = Router();

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

/** What an employer sees of a student. GPA is hidden when the student turned the shield on. */
function applicantView(user: any, profile: any) {
  const { gpa, hideGpa, resume: _r, userId: _u, ...rest } = profile ?? {};
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    ...rest,
    gpa: hideGpa ? undefined : gpa,
  };
}

router.post('/apply/:internshipId', requireAuth, requireRole('student'), validate(ApplySchema), async (req, res) => {
  const internshipId = String(req.params.internshipId);
  assertObjectId(internshipId, 'Internship');
  const { userId } = auth(req);
  const input = req.body as ApplyInput;
  await assertEmailVerified(userId);

  const internship = await InternshipModel.findById(internshipId).lean();
  if (!internship || internship.status === 'draft') throw notFound('Internship');
  if (!isAcceptingApplications(internship)) throw badRequest('This internship is no longer accepting applications');

  const profile = await StudentProfileModel.findOne({ userId }).lean();
  if (!profile?.resume?.fileId) throw badRequest('Upload your resume on your profile before applying');

  const answers = internship.questions.map((q: any) => {
    const answer = input.answers.find((a) => a.questionId === String(q._id))?.answer.trim() ?? '';
    if (q.required && !answer) throw badRequest(`Please answer: "${q.prompt}"`);
    return { questionId: String(q._id), prompt: q.prompt, answer };
  });

  if (await ApplicationModel.exists({ internshipId, studentId: userId })) {
    throw conflict('You have already applied to this internship');
  }

  const application = await ApplicationModel.create({
    internshipId,
    companyId: internship.companyId,
    studentId: userId,
    coverLetter: input.coverLetter,
    answers,
    resume: { fileId: profile.resume.fileId, fileName: profile.resume.fileName },
    history: [{ status: 'applied', by: userId }],
  });
  await InternshipModel.updateOne({ _id: internshipId }, { $inc: { applicationCount: 1 } });

  const [company, student] = await Promise.all([
    CompanyModel.findById(internship.companyId).select('members').lean(),
    UserModel.findById(userId).select('name').lean(),
  ]);
  await notify(company?.members ?? [], {
    title: `New applicant for ${internship.title}`,
    body: `${student?.name ?? 'A student'} applied.`,
    link: `/employer/internships/${internshipId}/applicants?app=${application._id}`,
  });

  res.status(201).json({ application });
});

router.get('/mine', requireAuth, requireRole('student'), async (req, res) => {
  const apps = await ApplicationModel.find({ studentId: auth(req).userId })
    .sort({ updatedAt: -1 })
    .select('-answers -coverLetter')
    .populate({
      path: 'internshipId',
      select: 'title city mode paid payAmount payCurrency payPeriod status deadline companyId',
      populate: { path: 'companyId', select: 'name slug logoUrl' },
    })
    .lean();
  res.json({
    items: apps.map((a: any) => ({
      ...a,
      internship: a.internshipId ? { ...a.internshipId, company: a.internshipId.companyId } : null,
      internshipId: String(a.internshipId?._id ?? a.internshipId),
    })),
  });
});

router.get(
  '/internship/:internshipId',
  requireAuth,
  requireRole('employer'),
  validate(z.object({ status: z.enum(APPLICATION_STATUSES).optional() }), 'query'),
  async (req, res) => {
    const internshipId = String(req.params.internshipId);
    assertObjectId(internshipId, 'Internship');
    const internship = await ownedInternship(internshipId, auth(req));
    const status = (req.query as { status?: ApplicationStatus }).status;

    const apps = await ApplicationModel.find({ internshipId, ...(status ? { status } : {}) })
      .sort({ createdAt: -1 })
      .populate({ path: 'studentId', select: 'name email' })
      .lean();
    const profiles = await StudentProfileModel.find({ userId: { $in: apps.map((a: any) => a.studentId?._id) } }).lean();
    const profileByUser = new Map(profiles.map((p) => [String(p.userId), p]));

    res.json({
      internship: { _id: internship._id, title: internship.title, status: internship.status, questions: internship.questions },
      items: apps.map((a: any) => ({
        ...a,
        studentId: String(a.studentId?._id),
        student: a.studentId ? applicantView(a.studentId, profileByUser.get(String(a.studentId._id))) : null,
      })),
    });
  },
);

router.get('/:id', requireAuth, async (req, res) => {
  const id = String(req.params.id);
  assertObjectId(id, 'Application');
  const { userId, role, companyId } = auth(req);
  const app: any = await ApplicationModel.findById(id)
    .populate({ path: 'internshipId', populate: { path: 'companyId', select: 'name slug logoUrl' } })
    .lean();
  if (!app) throw notFound('Application');

  const isStudent = role === 'student' && String(app.studentId) === userId;
  const isEmployer = role === 'employer' && String(app.companyId) === companyId;
  if (!isStudent && !isEmployer) throw forbidden();

  const conversation = await ConversationModel.findOne({ applicationId: app._id }).select('_id').lean();
  let student = null;
  if (isEmployer) {
    const [user, profile] = await Promise.all([
      UserModel.findById(app.studentId).select('name email').lean(),
      StudentProfileModel.findOne({ userId: app.studentId }).lean(),
    ]);
    student = user ? applicantView(user, profile) : null;
  }

  res.json({
    application: {
      ...app,
      internship: app.internshipId ? { ...app.internshipId, company: app.internshipId.companyId } : null,
      internshipId: String(app.internshipId?._id ?? app.internshipId),
      student,
      conversationId: conversation ? String(conversation._id) : null,
    },
  });
});

router.post('/:id/withdraw', requireAuth, requireRole('student'), async (req, res) => {
  const id = String(req.params.id);
  assertObjectId(id, 'Application');
  const { userId } = auth(req);
  const app = await ApplicationModel.findOne({ _id: id, studentId: userId });
  if (!app) throw notFound('Application');
  if (FINAL.includes(app.status as ApplicationStatus)) throw badRequest('This application can no longer be withdrawn');

  app.status = 'withdrawn';
  app.history.push({ status: 'withdrawn', by: userId, at: new Date() });
  await app.save();
  res.json({ application: app });
});

router.patch('/:id/status', requireAuth, requireRole('employer'), validate(ApplicationStatusUpdateSchema), async (req, res) => {
  const id = String(req.params.id);
  assertObjectId(id, 'Application');
  const { userId, companyId } = auth(req);
  const app = await ApplicationModel.findOne({ _id: id, companyId });
  if (!app) throw notFound('Application');
  if (app.status === 'withdrawn') throw badRequest('The student withdrew this application');

  const { status, note } = req.body as { status: ApplicationStatus; note?: string };
  if (app.status !== status) {
    app.status = status;
    app.history.push({ status, by: userId, note, at: new Date() });
    await app.save();

    const internship = await InternshipModel.findById(app.internshipId).select('title').lean();
    await notify(app.studentId, {
      title: `${internship?.title ?? 'Your application'}: ${STATUS_LABEL[status]}`,
      body: note ?? '',
      link: `/applications/${app._id}`,
    });
  }
  res.json({ application: app });
});

export default router;
