import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { Briefcase, CircleAlert, GraduationCap, MailCheck } from 'lucide-react';
import { ForgotPasswordSchema, LoginSchema, RegisterSchema, ResetPasswordSchema, type LoginInput } from '@shared/schemas';
import { GoogleButton } from '../components/GoogleButton';
import { Logo } from '../components/Layout';
import { Button, ButtonLink, Card, Input, Spinner, cx } from '../components/ui';
import { ApiError, IS_DEMO, api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { applyServerErrors } from '../lib/forms';

/** Only allow in-app redirects, never off-site ones. */
const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard');

function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-start justify-center px-4 py-10 sm:items-center">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </Card>
        {footer && <p className="mt-5 text-center text-sm text-slate-600">{footer}</p>}
      </div>
    </div>
  );
}

export function LoginPage() {
  const { user, login, google } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = safeNext(params.get('next'));
  const form = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });
  const { errors, isSubmitting } = form.formState;

  if (user) return <Navigate to={next} replace />;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const u = await login(values);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}`);
    } catch (err) {
      applyServerErrors(err, form.setError);
    }
  });

  const onGoogle = async (credential: string) => {
    try {
      const u = await google({ credential });
      toast.success(`Welcome back, ${u.name.split(' ')[0]}`);
    } catch (err) {
      // No account yet: sign-up needs to know if they're a student or an employer.
      if (err instanceof ApiError && err.status === 404) {
        toast.info('No account for that Google email yet. Choose student or employer, then continue with Google.');
        navigate(`/signup${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`);
        return;
      }
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  };

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back to WorkNest."
      footer={<>New here? <Link to={`/signup${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-brand-700 hover:underline">Create an account</Link></>}
    >
      <GoogleButton text="signin_with" onCredential={onGoogle} />
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...form.register('email')} />
        <div>
          <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...form.register('password')} />
          <Link to="/forgot-password" className="mt-1.5 inline-block text-sm font-semibold text-brand-700 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>Log in</Button>
      </form>
      {IS_DEMO && (
        <div className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-semibold text-ink">Demo accounts</p>
          <p className="mt-1">student@worknest.test or employer@worknest.test, password <code>Password123</code>.</p>
        </div>
      )}
    </AuthShell>
  );
}

// The form holds both shapes; RegisterSchema (a discriminated union) validates whichever role is chosen.
const SignupForm = z.object({
  role: z.enum(['student', 'employer']),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  companyName: z.string().optional(),
});
type SignupValues = z.infer<typeof SignupForm>;

export function SignupPage() {
  const { user, register: signup, google } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const form = useForm<SignupValues>({
    resolver: zodResolver(RegisterSchema as unknown as typeof SignupForm),
    defaultValues: { role: params.get('role') === 'employer' ? 'employer' : 'student', name: '', email: '', password: '', companyName: '' },
  });
  const role = form.watch('role');
  const { errors, isSubmitting } = form.formState;

  if (user) return <Navigate to={safeNext(params.get('next'))} replace />;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const u = await signup(values as never);
      toast.success(u.emailVerified === false ? `Your account is ready. We sent a verification link to ${u.email}.` : 'Your account is ready');
      navigate(u.role === 'student' ? '/profile?welcome=1' : '/employer/company?welcome=1', { replace: true });
    } catch (err) {
      applyServerErrors(err, form.setError);
    }
  });

  // Google supplies the name and a verified email; we still need the role (and company for employers).
  const onGoogle = async (credential: string) => {
    const { role, companyName = '' } = form.getValues();
    if (role === 'employer' && companyName.trim().length < 2) {
      form.setError('companyName', { message: 'Enter your company name, then continue with Google' });
      return;
    }
    try {
      const u = await google({ credential, role, companyName: role === 'employer' ? companyName.trim() : undefined });
      toast.success(`Welcome, ${u.name.split(' ')[0]}`);
      navigate(u.role === 'student' ? '/profile?welcome=1' : '/employer/company?welcome=1', { replace: true });
    } catch (err) {
      applyServerErrors(err, form.setError);
    }
  };

  const roleOption = (value: 'student' | 'employer', icon: ReactNode, title: string, body: string) => (
    <label className={cx('flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-3 transition-colors', role === value ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-slate-300')}>
      <input type="radio" value={value} className="sr-only" {...form.register('role')} />
      <span className="flex items-center gap-2 font-bold">{icon}{title}</span>
      <span className="text-xs text-slate-600">{body}</span>
    </label>
  );

  return (
    <AuthShell
      title="Create your account"
      subtitle="It's free for students and employers."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-800">I am…</legend>
          <div className="grid grid-cols-2 gap-3">
            {roleOption('student', <GraduationCap className="size-5 text-brand-700" />, 'A student', 'Looking for internships')}
            {roleOption('employer', <Briefcase className="size-5 text-brand-700" />, 'Hiring', 'Posting internships')}
          </div>
        </fieldset>
        {/* Company comes before the Google button because Google sign-up needs it too. */}
        {role === 'employer' && <Input label="Company name" autoComplete="organization" error={errors.companyName?.message} {...form.register('companyName')} />}
        <GoogleButton text="signup_with" onCredential={onGoogle} />
        <Input label="Full name" autoComplete="name" error={errors.name?.message} {...form.register('name')} />
        <Input label={role === 'employer' ? 'Work email' : 'Email'} type="email" autoComplete="email" error={errors.email?.message} {...form.register('email')} />
        <Input label="Password" type="password" autoComplete="new-password" hint="At least 8 characters, with a letter and a number" error={errors.password?.message} {...form.register('password')} />
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>Create account</Button>
      </form>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<{ email: string }>({ resolver: zodResolver(ForgotPasswordSchema) });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await api('/auth/forgot-password', { method: 'POST', body: values });
      setSentTo(values.email);
    } catch (err) {
      applyServerErrors(err, form.setError);
    }
  });

  if (sentTo) {
    return (
      <AuthShell title="Check your email" footer={<Link to="/login" className="font-semibold text-brand-700 hover:underline">Back to log in</Link>}>
        <div className="flex gap-3 text-sm text-slate-700">
          <MailCheck className="size-6 shrink-0 text-brand-700" />
          <p>If an account exists for <span className="font-semibold">{sentTo}</span>, we've sent a link to reset your password. It expires in one hour.</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we'll send you a reset link." footer={<Link to="/login" className="font-semibold text-brand-700 hover:underline">Back to log in</Link>}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" error={form.formState.errors.email?.message} {...form.register('email')} />
        <Button type="submit" className="w-full" size="lg" loading={form.formState.isSubmitting}>Send reset link</Button>
      </form>
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const form = useForm<{ token: string; password: string }>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { token: params.get('token') ?? '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await api('/auth/reset-password', { method: 'POST', body: values });
      toast.success('Password updated. Log in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      applyServerErrors(err, form.setError);
    }
  });

  if (!params.get('token')) return <Navigate to="/forgot-password" replace />;

  return (
    <AuthShell title="Choose a new password">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input label="New password" type="password" autoComplete="new-password" hint="At least 8 characters, with a letter and a number" error={form.formState.errors.password?.message} {...form.register('password')} />
        <Button type="submit" className="w-full" size="lg" loading={form.formState.isSubmitting}>Update password</Button>
      </form>
    </AuthShell>
  );
}

/** Landing page for the link in the verification email. */
export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const { user, reload } = useAuth();
  const [result, setResult] = useState<{ ok: true } | { ok: false; error: string } | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // The token is single-use, so don't let StrictMode's double effect spend it twice.
    if (!token || started.current) return;
    started.current = true;
    api('/auth/verify-email', { method: 'POST', body: { token } })
      .then(async () => {
        setResult({ ok: true });
        if (user) await reload().catch(() => {});
      })
      .catch((err) => setResult({ ok: false, error: err instanceof Error ? err.message : 'Verification failed' }));
  }, [token, user, reload]);

  if (!token) return <Navigate to="/" replace />;

  if (!result) {
    return (
      <AuthShell title="Verifying your email…">
        <div className="flex justify-center py-4"><Spinner className="size-6" /></div>
      </AuthShell>
    );
  }

  if (!result.ok) {
    return (
      <AuthShell title="This link didn't work">
        <div className="flex gap-3 text-sm text-slate-700">
          <CircleAlert className="size-6 shrink-0 text-red-600" />
          <p>{result.error} You can send yourself a new link from the banner at the top of any page after logging in.</p>
        </div>
        <ButtonLink to={user ? '/dashboard' : '/login'} className="mt-6 w-full" size="lg">{user ? 'Go to dashboard' : 'Log in'}</ButtonLink>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Email verified">
      <div className="flex gap-3 text-sm text-slate-700">
        <MailCheck className="size-6 shrink-0 text-brand-700" />
        <p>Thanks for confirming your email. You can now apply to and post internships.</p>
      </div>
      <ButtonLink to={user ? '/dashboard' : '/login'} className="mt-6 w-full" size="lg">{user ? 'Go to dashboard' : 'Log in'}</ButtonLink>
    </AuthShell>
  );
}
