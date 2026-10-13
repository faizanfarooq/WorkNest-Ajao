import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  GoogleAuthSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
  type GoogleAuthInput,
  type LoginInput,
  type RegisterInput,
} from '../../../shared/schemas.ts';
import { env, isProd } from '../../config/env.ts';
import { HttpError, badRequest, conflict, unauthorized, validate } from '../../lib/http.ts';
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
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
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
    // Only reported as unverified while verification is enforced; the frontend shows its banner off this.
    emailVerified: !env().REQUIRE_EMAIL_VERIFICATION || user.emailVerified !== false,
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

/** Stores a fresh single-use verification token and emails the link. Never throws: a mail outage shouldn't block sign-up. */
async function sendVerificationEmail(user: UserDoc) {
  const token = crypto.randomBytes(32).toString('base64url');
  await UserModel.updateOne(
    { _id: user._id },
    { emailVerifyHash: sha256(token), emailVerifyExpires: new Date(Date.now() + VERIFY_TTL_MS) },
  );
  const link = `${env().CLIENT_URL}/verify-email?token=${token}`;
  try {
    await sendMail({
      to: user.email,
      subject: 'Verify your WorkNest email',
      text: `Hi ${user.name},\n\nConfirm this is your email address so you can apply to and post internships. The link expires in 24 hours.\n\n${link}\n\nIf you didn't create a WorkNest account, you can ignore this email.`,
    });
  } catch (err) {
    console.error('[mail] could not send verification email', err);
  }
}

interface NewAccount {
  name: string;
  email: string;
  role: 'student' | 'employer';
  companyName?: string;
  passwordHash?: string;
  googleId?: string;
  emailVerified: boolean;
}

/** Creates the user plus their company (employers) or empty profile (students). */
async function createAccount({ companyName = '', ...fields }: NewAccount) {
  const user: UserDoc = await UserModel.create(fields);
  try {
    if (fields.role === 'employer') {
      const company = await CompanyModel.create({
        name: companyName,
        slug: await uniqueCompanySlug(companyName),
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
  return user;
}

router.post('/register', authLimiter, validate(RegisterSchema), async (req, res) => {
  const input = req.body as RegisterInput;
  if (await UserModel.exists({ email: input.email })) throw conflict('An account with this email already exists');

  const user = await createAccount({
    name: input.name,
    email: input.email,
    role: input.role,
    companyName: input.role === 'employer' ? input.companyName : undefined,
    passwordHash: await bcrypt.hash(input.password, 12),
    emailVerified: false,
  });
  if (env().REQUIRE_EMAIL_VERIFICATION) await sendVerificationEmail(user);
  res.status(201).json(await startSession(req, res, user));
});

let googleClient: OAuth2Client | undefined;

/** Checks the ID token's signature, expiry and audience against Google's public keys. */
async function verifyGoogleCredential(credential: string, clientId: string) {
  googleClient ??= new OAuth2Client();
  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId }).catch(() => null);
  const payload = ticket?.getPayload();
  if (!payload?.sub || !payload.email) throw unauthorized('Google sign-in failed. Please try again.');
  if (!payload.email_verified) throw badRequest('Your Google account email is not verified');
  return { googleId: payload.sub, email: payload.email.toLowerCase(), name: payload.name?.trim() };
}

router.get('/providers', (_req, res) => {
  res.json({ googleClientId: env().GOOGLE_CLIENT_ID || null });
});

router.post('/google', authLimiter, validate(GoogleAuthSchema), async (req, res) => {
  const clientId = env().GOOGLE_CLIENT_ID;
  if (!clientId) throw badRequest('Google sign-in is not set up on this server');
  const input = req.body as GoogleAuthInput;
  const google = await verifyGoogleCredential(input.credential, clientId);

  const existing: UserDoc | null = await UserModel.findOne({ $or: [{ googleId: google.googleId }, { email: google.email }] });
  if (existing) {
    // Google has proven who owns this address. If the account was never verified, whoever set its
    // password never proved they own the email, so drop that password and its sessions.
    if (existing.emailVerified === false) {
      existing.set('passwordHash', undefined);
      await RefreshTokenModel.deleteMany({ userId: existing._id });
    }
    existing.googleId ??= google.googleId;
    existing.emailVerified = true;
    existing.set({ emailVerifyHash: undefined, emailVerifyExpires: undefined });
    existing.lastLoginAt = new Date();
    await existing.save();
    return res.json(await startSession(req, res, existing));
  }

  if (!input.role) {
    throw new HttpError(404, 'There is no WorkNest account for this Google email yet. Create one first.', { code: 'NO_ACCOUNT' });
  }
  if (input.role === 'employer' && (input.companyName ?? '').length < 2) {
    throw badRequest('Validation failed', { companyName: ['Enter your company name'] });
  }
  const user = await createAccount({
    name: (google.name || google.email.split('@')[0]).slice(0, 80),
    email: google.email,
    role: input.role,
    companyName: input.companyName,
    googleId: google.googleId,
    emailVerified: true,
  });
  res.status(201).json(await startSession(req, res, user));
});

router.post('/verify-email', authLimiter, validate(VerifyEmailSchema), async (req, res) => {
  const user: UserDoc | null = await UserModel.findOne({
    emailVerifyHash: sha256(req.body.token),
    emailVerifyExpires: { $gt: new Date() },
  });
  if (!user) throw badRequest('This verification link is invalid or has expired. Log in to get a new one.');
  await UserModel.updateOne({ _id: user._id }, { emailVerified: true, $unset: { emailVerifyHash: 1, emailVerifyExpires: 1 } });
  res.json({ ok: true });
});

router.post('/resend-verification', requireAuth, authLimiter, async (req, res) => {
  const user: UserDoc | null = await UserModel.findById(auth(req).userId);
  if (!user) throw unauthorized();
  if (!env().REQUIRE_EMAIL_VERIFICATION || user.emailVerified !== false) return res.json({ ok: true, alreadyVerified: true });
  await sendVerificationEmail(user);
  res.json({ ok: true });
});

router.post('/login', authLimiter, validate(LoginSchema), async (req, res) => {
  const { email, password } = req.body as LoginInput;
  const user: UserDoc | null = await UserModel.findOne({ email }).select('+passwordHash');
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (user && !user.passwordHash) {
    throw unauthorized('This account signs in with Google. Use "Continue with Google", or reset your password to set one.');
  }
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
  if (user && !user.passwordHash) {
    throw badRequest('Your account uses Google sign-in. Use "Forgot password" on the login page to set a password.');
  }
  if (!user || !(await bcrypt.compare(req.body.currentPassword, user.passwordHash!))) {
    throw badRequest('Current password is incorrect');
  }
  user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  await user.save();
  await RefreshTokenModel.deleteMany({ userId: user._id });
  res.json(await startSession(req, res, user));
});

export default router;
