import { Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Building2, LayoutDashboard, LogOut, Menu, MessageSquare, Plus, Settings, User, X } from 'lucide-react';
import type { Role } from '@shared/schemas';
import { IS_DEMO, api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { timeAgo } from '../lib/format';
import type { Notification } from '../lib/types';
import { Avatar, ButtonLink, PageSpinner, cx } from './ui';

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-ink">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-brand-700" />
        <path d="M8 21l4-10 4 7 4-7 4 10" stroke="white" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-lg">WorkNest</span>
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

function NotificationsMenu() {
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
      <button onClick={toggle} className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label={`Notifications${data?.unread ? `, ${data.unread} unread` : ''}`}>
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

function MessagesLink() {
  const { data } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: () => api<{ count: number }>('/conversations/unread-count'),
    refetchInterval: 20_000,
  });
  return (
    <Link to="/messages" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label={`Messages${data?.count ? `, ${data.count} unread` : ''}`}>
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

  const items: [string, string, ReactNode][] = [
    ['/dashboard', 'Dashboard', <LayoutDashboard key="d" className="size-4" />],
    user.role === 'student'
      ? ['/profile', 'My profile', <User key="p" className="size-4" />]
      : ['/employer/company', 'Company page', <Building2 key="c" className="size-4" />],
    ['/settings', 'Settings', <Settings key="s" className="size-4" />],
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-slate-200" aria-label="Account menu">
        <Avatar name={user.name} size="sm" />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.company?.name ?? user.email}</p>
          </div>
          {items.map(([to, label, icon]) => (
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
            className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  cx('rounded-lg px-3 py-2 text-sm font-semibold transition-colors', isActive ? 'text-brand-800 bg-brand-50' : 'text-slate-600 hover:text-ink hover:bg-slate-100');

function Header() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMobileOpen(false), [location.pathname]);

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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={navClass}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              {user.role === 'employer' && (
                <ButtonLink to="/employer/internships/new" size="sm" className="hidden sm:inline-flex">
                  <Plus className="size-4" /> Post internship
                </ButtonLink>
              )}
              <MessagesLink />
              <NotificationsMenu />
              <AccountMenu />
            </>
          ) : (
            <>
              <Link to="/signup?role=employer" className="hidden px-3 text-sm font-semibold text-slate-600 hover:text-ink lg:block">
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
          <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu" aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => cx(navClass({ isActive }), 'block')}>
              {label}
            </NavLink>
          ))}
          {user?.role === 'employer' && (
            <NavLink to="/employer/internships/new" className={({ isActive }) => cx(navClass({ isActive }), 'block')}>
              Post internship
            </NavLink>
          )}
          {!user && (
            <>
              <NavLink to="/login" className={({ isActive }) => cx(navClass({ isActive }), 'block')}>
                Log in
              </NavLink>
              <NavLink to="/signup?role=employer" className={({ isActive }) => cx(navClass({ isActive }), 'block')}>
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

export function Layout() {
  const { ready } = useAuth();
  return (
    <div className="flex min-h-screen flex-col">
      {DemoBanner && ready && (
        <Suspense fallback={null}>
          <DemoBanner />
        </Suspense>
      )}
      <Header />
      <main className="flex-1">{ready ? <Outlet /> : <PageSpinner />}</main>
      <Footer />
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
