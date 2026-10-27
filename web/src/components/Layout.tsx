import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, Bookmark, Briefcase, Building2, ChevronDown, Home, Inbox, LayoutDashboard, LogOut, MailWarning, Menu, MessageSquare, Plus, Settings, User, Users, X } from 'lucide-react';
import type { Role } from '@shared/schemas';
import { IS_DEMO, api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toastError } from '../lib/forms';
import { timeAgo } from '../lib/format';
import { fetchProfile, profileSteps } from '../lib/profile';
import type { Internship, Notification } from '../lib/types';
import { Avatar, ButtonLink, PageSpinner, cx } from './ui';

/**
 * "work" in the wordmark. Each time the signed-in home opens it rolls up to "connect"
 * ("connectnest") for a moment, then rolls back.
 */
function RollingWord({ play }: { play: boolean }) {
  const { key } = useLocation();
  const [connect, setConnect] = useState(false);
  const work = useRef<HTMLSpanElement>(null);
  const other = useRef<HTMLSpanElement>(null);
  const [widths, setWidths] = useState<[number, number]>();

  // Measured before paint, and again once the web font loads and changes the widths.
  useLayoutEffect(() => {
    const measure = () => work.current && other.current && setWidths([work.current.offsetWidth, other.current.offsetWidth]);
    measure();
    document.fonts?.ready.then(measure);
  }, []);

  useEffect(() => {
    setConnect(false);
    if (!play || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const up = setTimeout(() => setConnect(true), 700);
    const back = setTimeout(() => setConnect(false), 3200);
    return () => {
      clearTimeout(up);
      clearTimeout(back);
    };
  }, [play, key]);

  return (
    <span
      className="inline-block h-7 overflow-hidden align-top transition-[width] duration-500 ease-out"
      style={widths && { width: widths[connect ? 1 : 0] }}
      aria-hidden
    >
      <span className={cx('flex flex-col transition-transform duration-500 ease-out', connect && '-translate-y-7')}>
        <span ref={work} className="w-max leading-7">work</span>
        <span ref={other} className="w-max leading-7">connect</span>
      </span>
    </span>
  );
}

/** `compact` folds the wordmark away so only the briefcase shows (the docked header). */
export function Logo({ light, compact }: { light?: boolean; compact?: boolean }) {
  const { user } = useAuth();
  const onHome = useLocation().pathname === '/home';
  return (
    <Link to={user ? '/home' : '/'} className={cx('flex items-center transition-all duration-500', compact ? 'gap-0' : 'gap-2', light ? 'text-white' : 'text-slate-900')}>
      {/* Briefcase cradling a nest curve. The outline follows the text colour so it works on the dark hero too. */}
      <svg viewBox="8 10 80 80" className="size-9" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" aria-hidden>
        <path d="M36 34 V27 a5 5 0 0 1 5 -5 h14 a5 5 0 0 1 5 5 V34" stroke="currentColor" />
        <rect x="14" y="34" width="68" height="46" rx="10" stroke="currentColor" />
        {/* Blue nest curve; a lighter blue on dark heroes so it stays visible. */}
        <path d="M24 52 Q48 72 72 52" className={light ? 'stroke-blue-400' : 'stroke-blue-600'} />
      </svg>
      <span
        className={cx(
          'overflow-hidden whitespace-nowrap font-logo text-xl font-semibold transition-[max-width,opacity] duration-500',
          compact ? 'max-w-0 opacity-0' : 'max-w-48 opacity-100',
        )}
      >
        <span className="sr-only">WorkNest</span>
        <RollingWord play={!!user && onHome} />
        <span className={cx('font-extrabold', light ? 'text-blue-400' : 'text-blue-600')} aria-hidden>nest</span>
      </span>
    </Link>
  );
}

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onOutside();
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onOutside]);
  return ref;
}

function NotificationsMenu({ light }: { light?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api<{ items: Notification[]; unread: number }>('/notifications'),
    refetchInterval: 30_000,
  });
  const markRead = useMutation({
    mutationFn: () => api('/notifications/read-all', { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const toggle = () => {
    setOpen((o) => !o);
    if (!open && data?.unread) markRead.mutate();
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className={cx('relative rounded-lg p-2', light ? 'text-white/85 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100')} aria-label={`Notifications${data?.unread ? `, ${data.unread} unread` : ''}`}>
        <Bell className="size-5" />
        {!!data?.unread && <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">{Math.min(data.unread, 9)}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold">Notifications</div>
          <div className="max-h-96 overflow-y-auto">
            {!data?.items.length && <p className="px-4 py-8 text-center text-sm text-slate-500">You're all caught up.</p>}
            {data?.items.map((n) => (
              <button
                key={n._id}
                onClick={() => {
                  setOpen(false);
                  if (n.link) navigate(n.link);
                }}
                className={cx('block w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50', !n.readAt && 'bg-brand-50/50')}
              >
                <p className="text-sm font-semibold text-ink">{n.title}</p>
                {n.body && <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{n.body}</p>}
                <p className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MessagesLink({ light }: { light?: boolean }) {
  const { data } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: () => api<{ count: number }>('/conversations/unread-count'),
    refetchInterval: 20_000,
  });
  return (
    <Link to="/messages" className={cx('relative rounded-lg p-2', light ? 'text-white/85 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100')} aria-label={`Messages${data?.count ? `, ${data.count} unread` : ''}`}>
      <MessageSquare className="size-5" />
      {!!data?.count && <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">{Math.min(data.count, 9)}</span>}
    </Link>
  );
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const navigate = useNavigate();
  if (!user) return null;

  const personal: [string, string, ReactNode][] =
    user.role === 'student'
      ? [
          ['/profile', 'Edit profile', <User key="p" className="size-4" />],
          ['/dashboard', 'My applications', <Inbox key="a" className="size-4" />],
          ['/saved', 'Saved internships', <Bookmark key="b" className="size-4" />],
          ['/settings', 'Settings', <Settings key="s" className="size-4" />],
        ]
      : [
          ['/dashboard', 'Dashboard', <LayoutDashboard key="d" className="size-4" />],
          ['/employer/company', 'Company page', <Building2 key="c" className="size-4" />],
          ['/settings', 'Settings', <Settings key="s" className="size-4" />],
        ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 rounded-full p-0.5 hover:ring-2 hover:ring-slate-200" aria-label="Account menu" aria-expanded={open}>
        <Avatar name={user.name} src={user.avatarUrl ?? undefined} size="sm" />
        <ChevronDown className={cx('hidden size-4 transition-transform sm:block', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
            <Avatar name={user.name} src={user.avatarUrl ?? undefined} size="md" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.company?.name ?? user.email}</p>
            </div>
          </div>
          <p className="px-4 pb-1 pt-3 text-xs font-medium text-slate-400">Personal</p>
          {personal.map(([to, label, icon]) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              {icon}
              {label}
            </Link>
          ))}
          <button
            onClick={async () => {
              setOpen(false);
              await logout();
              navigate('/');
            }}
            className="mt-1 flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="size-4" />
            Log out
          </button>
          {user.role === 'employer' && (
            <Link
              to="/employer/internships/new"
              onClick={() => setOpen(false)}
              className="block bg-brand-50 py-3 text-center text-xs font-bold uppercase tracking-wider text-brand-800 hover:bg-brand-100"
            >
              Post an internship
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/** Profile completeness for the sidebar dot. Only runs for students. */
function useProfileIncomplete(enabled: boolean) {
  const { data } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile, enabled });
  return !!data && profileSteps(data).some((s) => !s.done);
}

/** Signed-in app navigation: an icon rail on desktop, a tab bar along the bottom on phones. */
function SideNav() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const profileIncomplete = useProfileIncomplete(isStudent);
  const { data: unread } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: () => api<{ count: number }>('/conversations/unread-count'),
    refetchInterval: 20_000,
  });
  // Employers: applications still at "Applied", across all postings.
  const { data: postings } = useQuery({
    queryKey: ['my-internships'],
    queryFn: () => api<{ items: Internship[] }>('/internships/mine'),
    enabled: user?.role === 'employer',
  });
  const newApplicants = postings?.items.reduce((n, i) => n + (i.statusCounts?.applied ?? 0), 0) ?? 0;

  // desktopOnly: the phone tab bar fits five; those links stay reachable from the account menu.
  const items: { to: string; label: string; icon: typeof Home; dot?: boolean; count?: number; end?: boolean; desktopOnly?: boolean }[] = isStudent
    ? [
        { to: '/home', label: 'Home', icon: Home },
        { to: '/profile', label: 'Profile', icon: User, dot: profileIncomplete },
        { to: '/internships', label: 'Internships', icon: Briefcase },
        { to: '/saved', label: 'Saved', icon: Bookmark, desktopOnly: true },
        { to: '/dashboard', label: 'Applied', icon: Inbox },
        { to: '/messages', label: 'Messages', icon: MessageSquare, dot: !!unread?.count },
      ]
    : [
        { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { to: '/employer/applicants', label: 'Applicants', icon: Users, count: newApplicants },
        { to: '/employer/internships/new', label: 'Post', icon: Plus, end: true },
        { to: '/employer/company', label: 'Company', icon: Building2 },
        { to: '/messages', label: 'Messages', icon: MessageSquare, dot: !!unread?.count },
      ];

  const link = (mobile: boolean) =>
    items.filter((item) => !mobile || !item.desktopOnly).map(({ to, label, icon: Icon, dot, count, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          cx(
            'relative flex flex-col items-center gap-1 font-medium transition-colors',
            mobile ? 'py-2 text-[11px]' : 'rounded-xl px-1 py-3 text-xs',
            isActive ? 'text-brand-700' : 'text-slate-500 hover:text-ink',
            isActive && !mobile && 'bg-brand-50',
            !isActive && !mobile && 'hover:bg-slate-100',
          )
        }
      >
        <span className="relative">
          <Icon className={mobile ? 'size-5' : 'size-6'} strokeWidth={1.75} />
          {dot && <span className="absolute -right-1.5 -top-1 size-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
          {!!count && (
            <span className="absolute -right-3 -top-1.5 min-w-4.5 rounded-full bg-amber-500 px-1 text-center text-[10px] font-bold leading-4.5 text-white ring-2 ring-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </span>
        {label}
        {dot && <span className="sr-only">(needs attention)</span>}
        {!!count && <span className="sr-only">({count} new)</span>}
      </NavLink>
    ));

  return (
    <>
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-24 shrink-0 border-r border-slate-200 bg-white md:block">
        <nav className="flex flex-col gap-1 p-2 pt-4" aria-label="Main">{link(false)}</nav>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Main">
        {link(true)}
      </nav>
    </>
  );
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  cx('rounded-lg px-3 py-2 text-sm font-semibold transition-colors', isActive ? 'text-brand-800 bg-brand-50' : 'text-slate-600 hover:text-ink hover:bg-slate-100');

const overlayNavClass = ({ isActive }: { isActive: boolean }) =>
  cx('rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/10 hover:text-white', isActive ? 'bg-white/10 text-white' : 'text-white/85');

/** True once the page has scrolled past `offset` pixels. */
function useScrolled(enabled: boolean, offset = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!enabled) return setScrolled(false);
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled, offset]);
  return scrolled;
}

/** Pages whose hero the header floats over, for visitors. Signed in, they use the app layout. */
const VISITOR_OVERLAY_PATHS = ['/internships', '/companies', '/employers', '/login', '/signup'];

/** Light silver-blue pages where the header is always the floating frosted bar. */
const FLOATING_HEADER_PATHS = ['/login', '/signup'];

/** Whether the header floats transparent over a full-bleed dark hero on this page. */
export function useOverlayHeader() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  return pathname === '/' || (!user && VISITOR_OVERLAY_PATHS.includes(pathname));
}

/**
 * `overlay` makes a transparent, light-on-dark header that floats over a dark hero. Once the
 * page scrolls it docks into a floating glass capsule with a glowing scan line.
 */
function Header({ overlay }: { overlay?: boolean }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMobileOpen(false), [location.pathname]);
  const scrolled = useScrolled(!!overlay);
  // On the log-in and sign-up pages the header is always the floating frosted bar, with the full logo.
  const floating = !!overlay && FLOATING_HEADER_PATHS.includes(location.pathname);
  // Light-on-dark styling only while the header sits over a dark hero. The home and auth heroes
  // are light, so there the transparent header keeps its dark text and logo.
  const dark = overlay && !scrolled && !floating && location.pathname !== '/';
  const docked = overlay && (scrolled || floating);

  const links: [string, string][] =
    user?.role === 'employer'
      ? [
          ['/dashboard', 'Dashboard'],
          ['/internships', 'Browse internships'],
          ['/companies', 'Companies'],
        ]
      : [
          ['/internships', 'Find internships'],
          ['/companies', 'Companies'],
          ...(user ? ([['/dashboard', 'My applications']] as [string, string][]) : []),
        ];

  return (
    <header
      className={cx(
        'sticky top-0 z-30',
        overlay
          ? cx('transition-[padding] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]', docked ? 'px-3 py-2 sm:px-6' : 'p-0')
          : 'border-b border-slate-200 bg-white/95 backdrop-blur',
      )}
    >
      {/*
        Signed in, the header spans the full width so the logo sits above the side navigation.
        Docked, it is 8px + 64px + 8px tall, the same 80px as undocked, so the page never jumps.
      */}
      <div
        className={cx(
          'relative mx-auto flex items-center gap-4 px-4 sm:px-6',
          overlay
            ? cx(
                'transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]',
                docked ? 'h-16 max-w-6xl rounded-2xl bg-white/90 shadow-[0_10px_40px_-10px_rgb(15_23_42/0.35)] ring-1 ring-black/5 backdrop-blur-xl' : 'h-20 max-w-7xl',
              )
            : 'h-16',
          !overlay && (user ? 'max-w-none' : 'max-w-7xl'),
        )}
      >
        {overlay && (
          <span
            aria-hidden
            className={cx(
              'pointer-events-none absolute inset-x-8 -bottom-px h-px bg-size-[200%_100%] transition-opacity duration-500 motion-safe:animate-scan',
              floating
                ? 'bg-[linear-gradient(90deg,transparent,#38bdf8,#2563eb,transparent)]'
                : 'bg-[linear-gradient(90deg,transparent,var(--color-zest),var(--color-brand-500),transparent)]',
              docked ? 'opacity-100' : 'opacity-0',
            )}
          />
        )}
        <Logo light={dark} compact={docked && !floating} />
        {user?.role === 'employer' && !overlay && (
          <span className="hidden rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold tracking-wide text-zest sm:inline">EMPLOYERS</span>
        )}
        {/* Signed in, the side navigation takes over these links. */}
        {(!user || overlay) && <nav className={cx('hidden items-center gap-1 md:flex', overlay ? 'mx-auto' : 'ml-4')}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={dark ? overlayNavClass : navClass}>
              {label}
            </NavLink>
          ))}
          {overlay && !user && (
            <NavLink to="/employers" className={dark ? overlayNavClass : navClass}>
              For employers
            </NavLink>
          )}
        </nav>}
        <div className={cx('flex items-center gap-1 sm:gap-2', !overlay && 'ml-auto', overlay && 'ml-auto md:ml-0')}>
          {user ? (
            <>
              {user.role === 'employer' && (
                <ButtonLink to="/employer/internships/new" size="sm" className="hidden sm:inline-flex">
                  <Plus className="size-4" /> Post internship
                </ButtonLink>
              )}
              <MessagesLink light={dark} />
              <NotificationsMenu light={dark} />
              <AccountMenu />
            </>
          ) : overlay ? (
            <>
              <Link
                to="/login"
                className={cx(
                  'hidden rounded-lg border px-4 py-2 text-sm font-bold transition-colors sm:inline-flex',
                  dark ? 'border-white/70 text-white hover:bg-white/10' : 'border-ink text-ink hover:bg-slate-100',
                  floating && location.pathname === '/login' && 'ring-4 ring-slate-900/10',
                )}
              >
                Log in
              </Link>
              {/* Blue on the silver-blue auth pages, lime everywhere else. */}
              <Link
                to="/signup"
                className={cx(
                  'inline-flex rounded-lg px-4 py-2 text-sm font-bold transition',
                  floating
                    ? 'bg-linear-to-br from-blue-600 to-blue-500 text-white shadow-[0_8px_18px_-10px_rgb(37_99_235/0.8)] hover:brightness-110'
                    : 'bg-zest text-ink hover:bg-zest-hover',
                  floating && location.pathname === '/signup' && 'ring-4 ring-sky-400/30',
                )}
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <Link to="/employers" className="hidden px-3 text-sm font-semibold text-slate-600 hover:text-ink lg:block">
                For employers
              </Link>
              <ButtonLink to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                Log in
              </ButtonLink>
              <ButtonLink to="/signup" size="sm">
                Sign up
              </ButtonLink>
            </>
          )}
          {!user && (
            <button className={cx('rounded-lg p-2 transition-colors md:hidden', dark ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100')} onClick={() => setMobileOpen((o) => !o)} aria-label="Menu" aria-expanded={mobileOpen}>
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          )}
        </div>
      </div>
      {mobileOpen && !user && (
        <nav className={cx('space-y-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden', overlay && 'absolute inset-x-4 top-full rounded-xl border shadow-lg')}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => cx(navClass({ isActive }), 'block')}>
              {label}
            </NavLink>
          ))}
          {!user && (
            <>
              <NavLink to="/login" className={({ isActive }) => cx(navClass({ isActive }), 'block')}>
                Log in
              </NavLink>
              <NavLink to="/employers" className={({ isActive }) => cx(navClass({ isActive }), 'block')}>
                For employers
              </NavLink>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-slate-500">Internships for students and fresh graduates across Pakistan and remote.</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Students</p>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li><Link to="/internships" className="hover:text-ink">Browse internships</Link></li>
            <li><Link to="/companies" className="hover:text-ink">Companies</Link></li>
            <li><Link to="/signup" className="hover:text-ink">Create a profile</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Employers</p>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li><Link to="/signup?role=employer" className="hover:text-ink">Post an internship</Link></li>
            <li><Link to="/login" className="hover:text-ink">Employer log in</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} WorkNest</p>
    </footer>
  );
}

// Only the GitHub Pages demo build loads this.
const DemoBanner = IS_DEMO ? lazy(() => import('../demo/DemoBanner').then((m) => ({ default: m.DemoBanner }))) : null;

/** Nudges password sign-ups to confirm their email; applying and posting are blocked until they do. */
function VerifyEmailBanner() {
  const { user, reload } = useAuth();
  const resend = useMutation({
    mutationFn: () => api<{ alreadyVerified?: boolean }>('/auth/resend-verification', { method: 'POST' }),
    onSuccess: (res) => (res.alreadyVerified ? reload() : toast.success(`We sent a new link to ${user?.email}`)),
    onError: toastError,
  });
  if (user?.emailVerified !== false) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 text-amber-950">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm sm:px-6">
        <MailWarning className="size-4 shrink-0 text-amber-700" />
        <p className="min-w-0 flex-1">
          <span className="font-semibold">Verify your email</span> to apply to or post internships. We sent a link to{' '}
          <span className="break-all font-semibold">{user.email}</span>.
        </p>
        <button
          className="font-semibold text-amber-800 underline-offset-2 hover:underline disabled:opacity-50"
          onClick={() => resend.mutate()}
          disabled={resend.isPending}
        >
          {resend.isPending ? 'Sending…' : 'Resend link'}
        </button>
      </div>
    </div>
  );
}

export function Layout() {
  const { ready, user } = useAuth();
  const isHome = useLocation().pathname === '/';
  // Dark heroes run edge to edge behind a transparent header.
  const overlay = useOverlayHeader();
  // Signed-in pages work like an app: side navigation, no marketing footer.
  const app = ready && !!user && !isHome;
  return (
    <div className="flex min-h-screen flex-col">
      {DemoBanner && ready && (
        <Suspense fallback={null}>
          <DemoBanner />
        </Suspense>
      )}
      {ready && overlay && <VerifyEmailBanner />}
      <div className="relative flex flex-1 flex-col">
        <Header overlay={overlay} />
        {ready && !overlay && <VerifyEmailBanner />}
        <div className="flex flex-1">
          {app && <SideNav />}
          <main className={cx('min-w-0 flex-1', app && 'pb-16 md:pb-0')}>{ready ? <Outlet /> : <PageSpinner />}</main>
        </div>
      </div>
      {!app && <Footer />}
      <ScrollRestoration />
    </div>
  );
}

/** Sends signed-out visitors to /login (and back afterwards); blocks the wrong role. */
export function RequireAuth({ role, children }: { role?: Role; children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
