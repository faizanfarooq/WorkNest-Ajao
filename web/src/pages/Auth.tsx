import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { CircleAlert, MailCheck } from 'lucide-react';
import { AuthPage, FieldError, type AuthMode } from '../components/AuthPage';
import { Logo } from '../components/Layout';
import { ButtonLink, Card, Spinner } from '../components/ui';
import { ApiError, api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { PageMetadata } from '../components/PageMetadata';

/** Only allow in-app redirects, never off-site ones. */
const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/home');

function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <>
    <PageMetadata title={`${title} | WorkNest`} description="Manage your WorkNest account and discover internship opportunities." />
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
    </>
  );
}

/**
 * Log in and Sign up share this one screen (both routes render it), so switching tabs slides
 * between them instead of reloading the page. Sign-in is Google only: there are no WorkNest passwords.
 */
export function AuthScreen() {
  const { user, google } = useAuth();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mode: AuthMode = pathname.startsWith('/signup') ? 'signup' : 'login';
  const nextParam = params.get('next');
  const [notice, setNotice] = useState<string>();

  if (user) return <Navigate to={safeNext(nextParam)} replace />;

  const go = (m: AuthMode) => navigate({ pathname: `/${m}`, search: params.toString() ? `?${params}` : '' }, { replace: true });

  const onGoogle: Parameters<typeof AuthPage>[0]['onGoogle'] = async ({ mode, credential, role, companyName }) => {
    if (mode === 'login') {
      try {
        const u = await google({ credential });
        toast.success(`Welcome back, ${u.name.split(' ')[0]}`);
      } catch (err) {
        // No account yet: sign-up needs to know if they're a student or an employer.
        if (err instanceof ApiError && err.status === 404) {
          go('signup');
          setNotice('No WorkNest account for that Google email yet. Choose student or hiring, then sign up with Google.');
          return;
        }
        throw err;
      }
      return;
    }
    try {
      const u = await google({ credential, role, companyName: role === 'employer' ? companyName : undefined });
      toast.success(`Welcome, ${u.name.split(' ')[0]}`);
      navigate(u.role === 'student' ? '/home?welcome=1' : '/employer/company?welcome=1', { replace: true });
    } catch (err) {
      const companyIssue = err instanceof ApiError ? err.fieldErrors.companyName?.[0] : undefined;
      if (companyIssue) throw new FieldError('companyName', companyIssue);
      throw err;
    }
  };

  return (
    <>
    <PageMetadata
      title={mode === 'signup' ? 'Create your account | WorkNest' : 'Log in | WorkNest'}
      description="Sign in to WorkNest with Google to find internships or hire interns."
    />
    <AuthPage
      mode={mode}
      initialRole={params.get('role') === 'employer' ? 'employer' : 'student'}
      notice={notice}
      onModeChange={(m) => {
        setNotice(undefined);
        go(m);
      }}
      onGoogle={onGoogle}
    />
    </>
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
