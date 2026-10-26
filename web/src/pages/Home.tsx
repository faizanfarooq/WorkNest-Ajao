import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bell, FileText, MessageSquare, Search, ShieldCheck } from 'lucide-react';
import { HomeHero } from '../components/HomeHero';
import { InternshipRow } from '../components/internships';
import { ScrollShowcase } from '../components/ScrollShowcase';
import { Avatar, ButtonLink, CompanyName, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Company, Internship, Paged } from '../lib/types';

/** Soft teal-to-olive glow behind the "Hiring interns?" banner. */
const HERO_BACKGROUND = [
  'radial-gradient(55% 50% at 50% 36%, rgb(118 176 98 / 0.85), transparent 70%)',
  'radial-gradient(40% 50% at 90% 20%, rgb(62 148 158 / 0.85), transparent 70%)',
  'radial-gradient(40% 50% at 8% 18%, rgb(42 112 120 / 0.8), transparent 70%)',
  'radial-gradient(65% 40% at 55% 82%, rgb(112 132 42 / 0.7), transparent 70%)',
  'linear-gradient(180deg, #24504f 0%, #2a4a30 60%, #141c15 100%)',
].join(', ');

const SECTION_HEADING = 'font-display text-3xl uppercase tracking-wide sm:text-4xl';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const latest = useQuery({
    queryKey: ['internships', 'home'],
    queryFn: () => api<Paged<Internship>>('/internships', { query: { limit: 6 } }),
  });
  const companies = useQuery({ queryKey: ['companies'], queryFn: () => api<{ companies: Company[] }>('/companies') });

  const total = latest.data?.total;

  return (
    <>
      <HomeHero
        stats={[
          { value: total, label: 'open internships' },
          { value: companies.data?.companies.filter((c) => (c.openRoles ?? 0) > 0).length, label: 'hiring companies' },
        ]}
        onSearch={(params) => navigate(`/internships${params.size ? `?${params}` : ''}`)}
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className={SECTION_HEADING}>Latest internships</h2>
            <p className="mt-1 text-slate-600">Fresh roles from teams that are hiring now.</p>
          </div>
          <Link to="/internships" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:underline sm:flex">
            See all <ArrowRight className="size-4" />
          </Link>
        </div>
        {total !== undefined && <p className="mt-6 text-slate-500">{total} open {total === 1 ? 'internship' : 'internships'}</p>}
        <div className="mt-3 space-y-6">
          {latest.isLoading && <Spinner />}
          {latest.data?.items.map((i) => <InternshipRow key={i._id} internship={i} />)}
          {latest.data?.items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="font-bold">No internships posted yet</p>
              <p className="mt-1 text-sm text-slate-500">New roles show up here as soon as companies post them.</p>
              <Link to="/employers" className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">Hiring? Post the first internship →</Link>
            </div>
          )}
        </div>
        <ButtonLink to="/internships" variant="secondary" className="mt-6 w-full sm:hidden">See all internships</ButtonLink>
      </section>

      <ScrollShowcase />

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className={SECTION_HEADING}>How it works</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-4">
            {[
              { icon: FileText, title: 'Build one profile', body: 'Add your skills, projects and resume once. Reuse it for every application.' },
              { icon: Search, title: 'Find the right fit', body: 'Filter by city, remote, stipend and skills. Every listing shows pay up front.' },
              { icon: Bell, title: 'Track your status', body: 'See when you are under review, invited to interview or made an offer.' },
              { icon: MessageSquare, title: 'Talk to the team', body: 'Message the hiring team directly once they reach out.' },
            ].map(({ icon: Icon, title, body }, n) => (
              <div key={title}>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700"><Icon className="size-5" /></div>
                  <span className="text-sm font-bold text-slate-400">0{n + 1}</span>
                </div>
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-700" />
            <p>
              <span className="font-semibold">Your GPA is your call.</span> Hide it from employers and let your skills, projects and portfolio speak for you.
            </p>
          </div>
        </div>
      </section>

      {companies.data && companies.data.companies.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className={SECTION_HEADING}>Companies hiring interns</h2>
            <Link to="/companies" className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
              All companies <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {companies.data.companies.slice(0, 6).map((c) => (
              <Link key={c._id} to={`/companies/${c.slug}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm">
                <Avatar name={c.name} src={c.logoUrl} square />
                <div className="min-w-0 flex-1">
                  <p className="font-bold"><CompanyName name={c.name} verified={c.verified} /></p>
                  <p className="truncate text-sm text-slate-500">{c.tagline || c.industry}</p>
                </div>
                {!!c.openRoles && <span className="shrink-0 text-sm font-semibold text-brand-700">{c.openRoles} open</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {user?.role !== 'student' && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative isolate flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl bg-[#152a26] px-6 py-12 text-white sm:flex-row sm:items-center sm:px-10">
            <div className="absolute inset-0 -z-10 opacity-80" style={{ background: HERO_BACKGROUND }} aria-hidden />
            <div>
              <h2 className="font-display text-4xl uppercase sm:text-5xl">Hiring interns?</h2>
              <p className="mt-3 max-w-xl text-white/85">Post a role for free, review applicants in one place and message candidates directly.</p>
            </div>
            <Link
              to={user?.role === 'employer' ? '/employer/internships/new' : '/signup?role=employer'}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-zest px-6 py-3.5 font-bold text-ink transition-colors hover:bg-zest-hover"
            >
              Post an internship <ArrowRight className="size-5" />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
