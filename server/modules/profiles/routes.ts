import { Router } from 'express';
import multer from 'multer';
import { Types } from 'mongoose';
import { StudentProfileSchema, type StudentProfileInput } from '../../../shared/schemas.ts';
import { assertObjectId, badRequest, forbidden, notFound, validate } from '../../lib/http.ts';
import { auth, requireAuth, requireRole } from '../../middleware/auth.ts';
import { ApplicationModel } from '../applications/model.ts';
import { UserModel } from '../auth/models.ts';
import { deleteFile, findFile, openFile, storeFile } from '../files/gridfs.ts';
import { StudentProfileModel } from './model.ts';

const router = Router();

// Vercel caps request bodies at 4.5 MB; resumes rarely need more than 2.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1 } });

async function loadProfile(userId: string) {
  const [user, profile] = await Promise.all([
    UserModel.findById(userId).select('name email').lean(),
    StudentProfileModel.findOneAndUpdate({ userId }, { $setOnInsert: { userId } }, { upsert: true, returnDocument: 'after' }).lean(),
  ]);
  if (!user) throw notFound('User');
  return { ...profile, name: user.name, email: user.email };
}

router.get('/me', requireAuth, requireRole('student'), async (req, res) => {
  res.json({ profile: await loadProfile(auth(req).userId) });
});

router.put('/me', requireAuth, requireRole('student'), validate(StudentProfileSchema), async (req, res) => {
  const { name, ...rest } = req.body as StudentProfileInput;
  const userId = auth(req).userId;
  await Promise.all([
    UserModel.updateOne({ _id: userId }, { name }),
    StudentProfileModel.updateOne(
      { userId },
      { $set: rest, ...(rest.gpa === undefined ? { $unset: { gpa: 1 } } : {}) },
      { upsert: true },
    ),
  ]);
  res.json({ profile: await loadProfile(userId) });
});

router.post('/me/resume', requireAuth, requireRole('student'), upload.single('resume'), async (req, res) => {
  const file = req.file;
  if (!file) throw badRequest('Attach a PDF file named "resume"');
  if (file.buffer.subarray(0, 4).toString() !== '%PDF') throw badRequest('Resume must be a PDF');

  const userId = auth(req).userId;
  const fileName = file.originalname.replace(/[^\w.\- ]+/g, '_').slice(0, 100) || 'resume.pdf';
  const fileId = await storeFile(file.buffer, fileName, 'application/pdf', userId);

  const previous = await StudentProfileModel.findOneAndUpdate(
    { userId },
    { resume: { fileId, fileName, size: file.size, uploadedAt: new Date() } },
    { upsert: true },
  ).lean();

  // Keep the old file if an employer already received it with an application.
  const oldId = previous?.resume?.fileId;
  if (oldId && !(await ApplicationModel.exists({ 'resume.fileId': oldId }))) await deleteFile(oldId);

  res.json({ profile: await loadProfile(userId) });
});

router.delete('/me/resume', requireAuth, requireRole('student'), async (req, res) => {
  const userId = auth(req).userId;
  const previous = await StudentProfileModel.findOneAndUpdate({ userId }, { $unset: { resume: 1 } }).lean();
  const oldId = previous?.resume?.fileId;
  if (oldId && !(await ApplicationModel.exists({ 'resume.fileId': oldId }))) await deleteFile(oldId);
  res.json({ profile: await loadProfile(userId) });
});

/** Streams a resume to its owner, or to an employer whose company received it in an application. */
router.get('/resumes/:fileId', requireAuth, async (req, res) => {
  const id = String(req.params.fileId);
  assertObjectId(id, 'File');
  const fileId = new Types.ObjectId(id);
  const file = await findFile(fileId);
  if (!file) throw notFound('File');

  const { userId, role, companyId } = auth(req);
  const allowed =
    file.metadata?.ownerId === userId ||
    (role === 'employer' && companyId && (await ApplicationModel.exists({ companyId, 'resume.fileId': fileId })));
  if (!allowed) throw forbidden();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.filename)}"`);
  res.setHeader('Cache-Control', 'private, max-age=300');
  openFile(fileId).pipe(res);
});

export default router;
