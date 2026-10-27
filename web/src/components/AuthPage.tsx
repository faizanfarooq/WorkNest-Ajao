import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { GOOGLE_ENABLED, GoogleSignInCancelled, getGoogleIdToken } from '../lib/firebase';
import { cx } from './ui';
import './AuthPage.css';

export type AuthMode = 'login' | 'signup';
export type AuthRole = 'student' | 'employer';

const COPY = {
  login: {
    lead: 'Pick up where you left off. Your saved internships and applications are waiting.',
  },
  signup: {
    lead: {
      student: 'Build one profile, get matched to paid and remote internships, and apply in one tap.',
      employer: 'Post internships for free and review every student applicant in one place.',
    },
  },
};

const ROLES: { id: AuthRole; em: string; title: string; sub: string }[] = [
  { id: 'student', em: '🎓', title: "I'm a student", sub: 'Find internships' },
  { id: 'employer', em: '🏢', title: "I'm hiring", sub: 'Post internships' },
];

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Thrown by `onGoogle` to show a message under a field instead of under the card. */
export class FieldError extends Error {
  constructor(public field: 'companyName', message: string) {
    super(message);
  }
}

/**
 * Log in / Sign up page (greyish white · blue · sky blue · silver). Both modes live on one page so
 * switching tabs slides the card and swaps the headline instead of reloading. Sign-in is Google only.
 * Design reference: worknest-auth AuthPage.jsx (silver-blue).
 */
export function AuthPage({
  mode,
  initialRole = 'student',
  notice,
  onModeChange,
  onGoogle,
}: {
  mode: AuthMode;
  initialRole?: AuthRole;
  /** Message shown under the card, e.g. "no account yet" after a log-in attempt. */
  notice?: string;
  onModeChange: (mode: AuthMode) => void;
  /** Gets Google's ID token plus the sign-up choices; throws to show an error. */
  onGoogle: (input: { mode: AuthMode; credential: string; role: AuthRole; companyName: string }) => Promise<void>;
}) {
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [companyName, setCompanyName] = useState('');
  const [companyError, setCompanyError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const companyInput = useRef<HTMLInputElement>(null);
  const headwrap = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const loginPane = useRef<HTMLDivElement>(null);
  const signupPane = useRef<HTMLDivElement>(null);

  // The card's height follows the visible pane, so it grows or shrinks smoothly between tabs
  // (and when the company field opens).
  useLayoutEffect(() => {
    const vp = viewport.current;
    const pane = mode === 'signup' ? signupPane.current : loginPane.current;
    if (!vp || !pane) return;
    const size = () => {
      vp.style.height = `${pane.offsetHeight}px`;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(pane);
    return () => ro.disconnect();
  }, [mode]);

  // Fade the paragraph out, swap the text, fade back in.
  const target = mode === 'signup' ? COPY.signup.lead[role] : COPY.login.lead;
  const [lead, setLead] = useState(target);
  const [leadVisible, setLeadVisible] = useState(true);
  useEffect(() => {
    if (target === lead) return;
    setLeadVisible(false);
    const t = setTimeout(() => {
      setLead(target);
      setLeadVisible(true);
    }, 280);
    return () => clearTimeout(t);
  }, [target, lead]);

  useEffect(() => setError(notice ?? ''), [notice]);

  const switchTo = (m: AuthMode) => {
    if (m === mode) return;
    setError('');
    onModeChange(m);
  };

  const handleGoogle = async () => {
    setError('');
    if (mode === 'signup' && role === 'employer' && companyName.trim().length < 2) {
      setCompanyError('Enter your company name, then sign up with Google');
      companyInput.current?.focus();
      return;
    }
    setLoading(true);
    try {
      const credential = await getGoogleIdToken();
      await onGoogle({ mode, credential, role, companyName: companyName.trim() });
    } catch (e) {
      if (e instanceof GoogleSignInCancelled) return;
      if (e instanceof FieldError) setCompanyError(e.message);
      else setError(e instanceof Error ? e.message : "Sign-in didn't work. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fit both headlines into the left column.
  useLayoutEffect(() => {
    const wrap = headwrap.current;
    if (!wrap) return;
    const fit = () => {
      wrap.style.removeProperty('--hs');
      const base = parseFloat(getComputedStyle(wrap.querySelector('.head')!).fontSize);
      const widest = Math.max(...Array.from(wrap.querySelectorAll<HTMLElement>('.line'), (l) => l.scrollWidth));
      if (widest > wrap.clientWidth) wrap.style.setProperty('--hs', `${Math.floor((base * wrap.clientWidth) / widest)}px`);
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // Fireflies, placed once.
  const flies = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const s = Math.random() * 3 + 2;
        return {
          id: i,
          style: {
            left: `${Math.random() * 100}%`,
            width: `${s}px`,
            height: `${s}px`,
            opacity: 0.4 + Math.random() * 0.6,
            '--dx': `${(Math.random() - 0.5) * 160}px`,
            animationDuration: `${18 + Math.random() * 22}s, ${2 + Math.random() * 3}s`,
            animationDelay: `${-Math.random() * 40}s, ${-Math.random() * 3}s`,
          } as CSSProperties,
        };
      }),
    [],
  );

  const googleButton = (label: string, active: boolean) =>
    GOOGLE_ENABLED ? (
      <button type="button" className={cx('google', loading && active && 'loading')} onClick={handleGoogle} tabIndex={active ? 0 : -1} aria-busy={loading && active}>
        <GoogleIcon /> {label}
      </button>
    ) : (
      <p className="notice">Google sign-in isn't set up on this site yet. Add the Firebase settings to <code>.env</code> and restart.</p>
    );

  return (
    <div className="auth-page" data-mode={mode}>
      <main className="page">
        <div className="aurora" aria-hidden>
          <div className="ribbon r1" />
          <div className="ribbon r2" />
          <div className="ribbon r3" />
          {flies.map((f) => <span key={f.id} className="firefly" style={f.style} />)}
        </div>
        <div className="dots" aria-hidden />
        <div className="vignette" aria-hidden />
        <div className="sheen" aria-hidden />

        {/* LEFT */}
        <section className="left">
          <div className="headwrap" ref={headwrap}>
            <h1 className={cx('head', mode === 'login' && 'show')} aria-hidden={mode !== 'login'}>
              <span className="line"><span className="in">Welcome</span></span>
              <span className="line"><span className="in">back</span></span>
            </h1>
            <h1 className={cx('head', mode === 'signup' && 'show')} aria-hidden={mode !== 'signup'}>
              <span className="line"><span className="in">Your career</span></span>
              <span className="line"><span className="in">starts here</span></span>
            </h1>
          </div>
          <p className="lead" style={{ opacity: leadVisible ? 1 : 0 }}>{lead}</p>
        </section>

        {/* RIGHT */}
        <section className="card">
          <div className="tabs" role="tablist">
            <span className="ind" />
            <button type="button" role="tab" aria-selected={mode === 'login'} data-to="login" onClick={() => switchTo('login')}>Log in</button>
            <button type="button" role="tab" aria-selected={mode === 'signup'} data-to="signup" onClick={() => switchTo('signup')}>Sign up</button>
          </div>

          <div className="viewport" ref={viewport}>
            <div className="slider">
              {/* LOG IN */}
              <div className="pane login" ref={loginPane} aria-hidden={mode !== 'login'}>
                <h2>Log in</h2>
                <p className="desc">Welcome back to WorkNest. Sign in with your Google account.</p>
                {googleButton('Continue with Google', mode === 'login')}
                <div className="divider">why log in</div>
                <div className="perks">
                  <div><span>✓</span>Track every application in one place</div>
                  <div><span>✓</span>Get internships matched to your skills</div>
                </div>
                <p className="switch">
                  New here? <button type="button" onClick={() => switchTo('signup')} tabIndex={mode === 'login' ? 0 : -1}>Create an account</button>
                </p>
              </div>

              {/* SIGN UP */}
              <div className="pane signup" ref={signupPane} aria-hidden={mode !== 'signup'}>
                <h2>Create your account</h2>
                <p className="desc">Free for students and employers. Takes a few seconds with Google.</p>
                <div className="roles">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={cx('role', role === r.id && 'on')}
                      onClick={() => setRole(r.id)}
                      aria-pressed={role === r.id}
                      tabIndex={mode === 'signup' ? 0 : -1}
                    >
                      <span className="tick" aria-hidden>✓</span>
                      <span className="em" aria-hidden>{r.em}</span>
                      <b>{r.title}</b>
                      <small>{r.sub}</small>
                    </button>
                  ))}
                </div>
                {/* Employers also need a company; it slides open under the role cards. */}
                <div className={cx('company', role === 'employer' && 'open')}>
                  <label>
                    <span>Company name</span>
                    <input
                      ref={companyInput}
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        setCompanyError('');
                      }}
                      autoComplete="organization"
                      placeholder="e.g. Ledgerly"
                      tabIndex={mode === 'signup' && role === 'employer' ? 0 : -1}
                      aria-invalid={!!companyError}
                    />
                  </label>
                  {companyError && <p className="field-error">{companyError}</p>}
                </div>
                {googleButton('Sign up with Google', mode === 'signup')}
                <p className="switch">
                  Already have an account? <button type="button" onClick={() => switchTo('login')} tabIndex={mode === 'signup' ? 0 : -1}>Log in</button>
                </p>
              </div>
            </div>
          </div>
          <p className="error" role="alert">{error}</p>
        </section>
      </main>
    </div>
  );
}
