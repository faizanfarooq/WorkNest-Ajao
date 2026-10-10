import type { NextFunction, Request, Response } from 'express';
import { z, type ZodType } from 'zod';
import mongoose from 'mongoose';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (msg: string, details?: unknown) => new HttpError(400, msg, details);
export const unauthorized = (msg = 'Please sign in to continue') => new HttpError(401, msg);
export const forbidden = (msg = 'You do not have access to this resource') => new HttpError(403, msg);
export const notFound = (what = 'Resource') => new HttpError(404, `${what} not found`);
export const conflict = (msg: string) => new HttpError(409, msg);

type Part = 'body' | 'query' | 'params';

/** Validates and replaces req[part] with the parsed (typed, coerced, stripped) value. */
export function validate(schema: ZodType, part: Part = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      return next(badRequest('Validation failed', z.flattenError(result.error).fieldErrors));
    }
    // Express 5 makes req.query a getter, so define it instead of assigning.
    Object.defineProperty(req, part, { value: result.data, writable: true, configurable: true });
    next();
  };
}

export function assertObjectId(id: string, what = 'Resource') {
  if (!mongoose.isValidObjectId(id)) throw notFound(what);
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ error: 'That record already exists' });
  }
  if (err?.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side' });
}

export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
