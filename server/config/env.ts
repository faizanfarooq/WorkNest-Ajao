import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 random characters'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().default('WorkNest <onboarding@resend.dev>'),
  // Off until real email delivery (RESEND_API_KEY) is set up. When on, new password sign-ups get a
  // verification link and can't apply to or publish internships until they click it.
  REQUIRE_EMAIL_VERIFICATION: z.stringbool().default(false),
  // Google sign-in via Firebase. The project ID is public; ID tokens are verified against Google's public keys.
  FIREBASE_PROJECT_ID: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

/** Validates process.env once. Fails fast with a readable message instead of falling back to defaults. */
export function env(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}\nCopy .env.example to .env and fill it in.`);
  }
  cached = parsed.data;
  return cached;
}

export const isProd = () => env().NODE_ENV === 'production';
