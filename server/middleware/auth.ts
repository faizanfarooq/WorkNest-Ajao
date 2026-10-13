import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';
import { forbidden, unauthorized } from '../lib/http.ts';
import type { Role } from '../../shared/schemas.ts';
import { UserModel } from '../modules/auth/models.ts';

export interface AuthContext {
  userId: string;
  role: Role;
  companyId?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export const ACCESS_TOKEN_TTL = '15m';

export function signAccessToken(ctx: AuthContext) {
  return jwt.sign({ role: ctx.role, companyId: ctx.companyId }, env().JWT_SECRET, {
    subject: ctx.userId,
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

function readToken(req: Request): AuthContext | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  try {
    const payload = jwt.verify(header.slice(7), env().JWT_SECRET) as jwt.JwtPayload;
    return { userId: payload.sub!, role: payload.role, companyId: payload.companyId };
  } catch {
    return undefined;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const ctx = readToken(req);
  if (!ctx) return next(unauthorized());
  req.auth = ctx;
  next();
}

/** Attaches req.auth when a valid token is present but never rejects. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  req.auth = readToken(req);
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(unauthorized());
    if (!roles.includes(req.auth.role)) return next(forbidden());
    if (req.auth.role === 'employer' && !req.auth.companyId) return next(forbidden('No company linked to this account'));
    next();
  };
}

/** Applying and publishing need a confirmed email. Accounts from before verification existed have no flag and pass. */
export async function assertEmailVerified(userId: string) {
  if (!env().REQUIRE_EMAIL_VERIFICATION) return;
  if (!(await UserModel.exists({ _id: userId, emailVerified: { $ne: false } }))) {
    throw forbidden('Verify your email first. Use the link we emailed you, or resend it from the banner at the top of the page.');
  }
}

/** Narrowing helper for handlers that sit behind requireAuth. */
export function auth(req: Request): AuthContext {
  if (!req.auth) throw unauthorized();
  return req.auth;
}
