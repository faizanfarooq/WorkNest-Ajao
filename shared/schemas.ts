import { z } from 'zod';

// ---------- Constants ----------

export const ROLES = ['student', 'employer', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Hyderabad',
] as const;

export const WORK_MODES = ['onsite', 'hybrid', 'remote'] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const CURRENCIES = ['PKR', 'USD'] as const;
export const PAY_PERIODS = ['month', 'week', 'total'] as const;

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+'] as const;

export const INTERNSHIP_STATUSES = ['draft', 'open', 'closed'] as const;
export type InternshipStatus = (typeof INTERNSHIP_STATUSES)[number];

export const APPLICATION_STATUSES = [
  'applied',
  'reviewing',
  'interview',
  'offered',
  'hired',
  'rejected',
  'withdrawn',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/** Statuses an employer may move an application into. */
export const EMPLOYER_STATUSES = ['reviewing', 'interview', 'offered', 'hired', 'rejected'] as const;

// ---------- Helpers ----------

const trimmed = (max: number) => z.string().trim().max(max);
const optionalUrl = z.union([z.literal(''), z.url({ message: 'Enter a full URL starting with https://' })]).optional();
const skillList = z
  .array(z.string().trim().min(1).max(40))
  .max(30)
  .transform((arr) => [...new Map(arr.map((s) => [s.toLowerCase(), s])).values()]);

const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(128)
  .regex(/[a-zA-Z]/, 'Include at least one letter')
  .regex(/[0-9]/, 'Include at least one number');

// ---------- Auth ----------

export const RegisterSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('student'),
    name: trimmed(80).min(2, 'Enter your full name'),
    email: z.email('Enter a valid email').trim().toLowerCase(),
    password,
  }),
  z.object({
    role: z.literal('employer'),
    name: trimmed(80).min(2, 'Enter your full name'),
    email: z.email('Enter a valid email').trim().toLowerCase(),
    password,
    companyName: trimmed(80).min(2, 'Enter your company name'),
  }),
]);
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.email('Enter a valid email').trim().toLowerCase(),
  password: z.string().min(1, 'Enter your password'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.email('Enter a valid email').trim().toLowerCase(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(10),
  password,
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});

// ---------- Profiles ----------

export const StudentProfileSchema = z.object({
  name: trimmed(80).min(2),
  headline: trimmed(120).default(''),
  university: trimmed(120).default(''),
  degree: trimmed(80).default(''),
  graduationYear: z.coerce.number().int().min(2000).max(2040).optional(),
  city: trimmed(60).default(''),
  bio: trimmed(2000).default(''),
  skills: skillList.default([]),
  gpa: z.coerce.number().min(0).max(4).optional(),
  hideGpa: z.boolean().default(true),
  links: z
    .object({
      github: optionalUrl,
      linkedin: optionalUrl,
      portfolio: optionalUrl,
    })
    .default({}),
});
export type StudentProfileInput = z.infer<typeof StudentProfileSchema>;

export const CompanySchema = z.object({
  name: trimmed(80).min(2),
  tagline: trimmed(140).default(''),
  about: trimmed(4000).default(''),
  website: optionalUrl,
  logoUrl: optionalUrl,
  city: trimmed(60).default(''),
  industry: trimmed(60).default(''),
  size: z.enum(COMPANY_SIZES).default('1-10'),
});
export type CompanyInput = z.infer<typeof CompanySchema>;

// ---------- Internships ----------

export const QuestionSchema = z.object({
  _id: z.string().optional(),
  prompt: trimmed(300).min(3),
  required: z.boolean().default(true),
});

export const InternshipSchema = z
  .object({
    title: trimmed(120).min(4, 'Give the role a clear title'),
    description: trimmed(8000).min(50, 'Describe the role in at least 50 characters'),
    requirements: z.array(trimmed(300).min(1)).max(20).default([]),
    skills: skillList.default([]),
    city: trimmed(60).default(''),
    mode: z.enum(WORK_MODES),
    paid: z.boolean(),
    payAmount: z.coerce.number().int().min(0).max(10_000_000).default(0),
    payCurrency: z.enum(CURRENCIES).default('PKR'),
    payPeriod: z.enum(PAY_PERIODS).default('month'),
    durationWeeks: z.coerce.number().int().min(1).max(52),
    openings: z.coerce.number().int().min(1).max(100).default(1),
    deadline: z.coerce.date().optional(),
    questions: z.array(QuestionSchema).max(5).default([]),
    status: z.enum(['draft', 'open']).default('open'),
  })
  .refine((v) => v.mode === 'remote' || v.city.length > 0, {
    message: 'City is required for onsite and hybrid roles',
    path: ['city'],
  })
  .refine((v) => !v.paid || v.payAmount > 0, {
    message: 'Enter the stipend amount for a paid internship',
    path: ['payAmount'],
  });
export type InternshipInput = z.infer<typeof InternshipSchema>;

export const InternshipStatusSchema = z.object({ status: z.enum(INTERNSHIP_STATUSES) });

export const InternshipQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  city: z.string().trim().max(60).optional(),
  mode: z.enum(WORK_MODES).optional(),
  paid: z.enum(['true', 'false']).optional(),
  skill: z.string().trim().max(40).optional(),
  company: z.string().trim().max(80).optional(),
  sort: z.enum(['recent', 'pay', 'deadline']).default('recent'),
  page: z.coerce.number().int().min(1).max(500).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type InternshipQuery = z.infer<typeof InternshipQuerySchema>;

// ---------- Applications ----------

export const ApplySchema = z.object({
  coverLetter: trimmed(4000).default(''),
  answers: z
    .array(z.object({ questionId: z.string(), answer: trimmed(2000) }))
    .max(5)
    .default([]),
});
export type ApplyInput = z.infer<typeof ApplySchema>;

export const ApplicationStatusUpdateSchema = z.object({
  status: z.enum(EMPLOYER_STATUSES),
  note: trimmed(500).optional(),
});

// ---------- Messages ----------

export const MessageSchema = z.object({
  body: trimmed(4000).min(1, 'Message cannot be empty'),
});
