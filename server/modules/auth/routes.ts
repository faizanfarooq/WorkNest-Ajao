import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  type LoginInput,
  type RegisterInput,
} from '../../../shared/schemas.ts';
import { env, isProd } from '../../config/env.ts';
import { badRequest, conflict, unauthorized, validate } from '../../lib/http.ts';
import { sendMail } from '../../lib/mailer.ts';
import { auth, requireAuth, signAccessToken } from '../../middleware/auth.ts';
import { CompanyModel } from '../companies/model.ts';
import { uniqueCompanySlug } from '../companies/service.ts';
import { StudentProfileModel } from '../profiles/model.ts';
import { RefreshTokenModel, UserModel, type UserDoc } from './models.ts';

const router = Router();

const REFRESH_COOKIE = 'wn_rt';
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
// Compared against when the email doesn't exist so response timing doesn't reveal registered emails.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env().NODE_ENV === 'test',
  message: { error: 'Too many attempts. Try again in a few minutes.' },
});

const cookieOptions = () => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: 'lax' as const,
  path: '/api/auth',
});

async function toPublicUser(user: UserDoc) {
  const company = user.companyId ? await CompanyModel.findById(user.companyId).select('name slug logoUrl').lean() : null;
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    company: company ? { id: String(company._id), name: company.name, slug: company.slug, logoUrl: company.logoUrl } : null,
  };
}

/** Issues a fresh access token + rotating refresh cookie and returns the session payload. */
async function startSession(req: Request, res: Response, user: UserDoc) {
  const refreshToken = crypto.randomBytes(48).toString('base64url');
  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: sha256(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    userAgent: req.get('user-agent')?.slice(0, 200),
  });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieOptions(), maxAge: REFRESH_TTL_MS });
  const accessToken = signAccessToken({
    userId: String(user._id),
    role: user.role,
    companyId: user.companyId ? String(user.companyId) : undefined,
  });
  return { accessToken, user: await toPublicUser(user) };
}

router.post('/register', authLimiter, validate(RegisterSchema), async (req, res) => {
  const input = req.body as RegisterInput;
  if (await UserModel.exists({ email: input.email })) throw conflict('An account with this email already exists');

  const user: UserDoc = await UserModel.create({
    name: input.name,
    email: input.email,
    role: input.role,
    passwordHash: await bcrypt.hash(input.password, 12),
  });

  try {
    if (input.role === 'employer') {
      const company = await CompanyModel.create({
        name: input.companyName,
        slug: await uniqueCompanySlug(input.companyName),
        ownerId: user._id,
        members: [user._id],
      });
      user.companyId = company._id;
      await user.save();
    } else {
      await StudentProfileModel.create({ userId: user._id });
    }
  } catch (err) {
    // No multi-document transaction (keeps local standalone Mongo working), so undo by hand.
    await UserModel.deleteOne({ _id: user._id });
    throw err;
  }

  res.status(201).json(await startSession(req, res, user));
});

router.post('/login', authLimiter, validate(LoginSchema), async (req, res) => {
  const { email, password } = req.body as LoginInput;
  const user: UserDoc | null = await UserModel.findOne({ email }).select('+passwordHash');
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw unauthorized('Incorrect email or password');

  user.lastLoginAt = new Date();
  await user.save();
  res.json(await startSession(req, res, user));
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw unauthorized('No active session');

  // Single-use: deleting on read means a stolen-and-replayed token fails.
  const stored = await RefreshTokenModel.findOneAndDelete({ tokenHash: sha256(token), expiresAt: { $gt: new Date() } });
  const user: UserDoc | null = stored ? await UserModel.findById(stored.userId) : null;
  if (!user) {
    res.clearCookie(REFRESH_COOKIE, cookieOptions());
    throw unauthorized('Session expired. Please sign in again.');
  }
  res.json(await startSession(req, res, user));
});

router.post('/logout', async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) await RefreshTokenModel.deleteOne({ tokenHash: sha256(token) });
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
  res.status(204).end();
});

router.get('/me', requireAuth, async (req, res) => {
  const user: UserDoc | null = await UserModel.findById(auth(req).userId);
  if (!user) throw unauthorized();
  res.json({ user: await toPublicUser(user) });
});

router.post('/forgot-password', authLimiter, validate(ForgotPasswordSchema), async (req, res) => {
  const user: UserDoc | null = await UserModel.findOne({ email: req.body.email });
  if (user) {
    const token = crypto.randomBytes(32).toString('base64url');
    await UserModel.updateOne(
      { _id: user._id },
      { passwordResetHash: sha256(token), passwordResetExpires: new Date(Date.now() + RESET_TTL_MS) },
    );
    const link = `${env().CLIENT_URL}/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your WorkNest password',
      text: `Hi ${user.name},\n\nUse this link to choose a new password. It expires in 1 hour.\n\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
    });
  }
  // Same response either way so this endpoint can't be used to discover accounts.
  res.json({ ok: true });
});

router.post('/reset-password', authLimiter, validate(ResetPasswordSchema), async (req, res) => {
  const user: UserDoc | null = await UserModel.findOne({
    passwordResetHash: sha256(req.body.token),
    passwordResetExpires: { $gt: new Date() },
  });
  if (!user) throw badRequest('This reset link is invalid or has expired');

  await UserModel.updateOne(
    { _id: user._id },
    { passwordHash: await bcrypt.hash(req.body.password, 12), $unset: { passwordResetHash: 1, passwordResetExpires: 1 } },
  );
  await RefreshTokenModel.deleteMany({ userId: user._id });
  res.json({ ok: true });
});

router.post('/change-password', requireAuth, validate(ChangePasswordSchema), async (req, res) => {
  const user: UserDoc | null = await UserModel.findById(auth(req).userId).select('+passwordHash');
  if (!user || !(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) {
    throw badRequest('Current password is incorrect');
  }
  user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  await user.save();
  await RefreshTokenModel.deleteMany({ userId: user._id });
  res.json(await startSession(req, res, user));
});

export default router;
