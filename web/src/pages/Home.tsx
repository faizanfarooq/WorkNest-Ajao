import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bell, FileText, MapPin, MessageSquare, Search, ShieldCheck } from 'lucide-react';
import { CITIES } from '@shared/schemas';
import { InternshipCard } from '../components/internships';
import { PageMetadata } from '../components/PageMetadata';
import { Avatar, Button, ButtonLink, CompanyName, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Company, Internship, Paged } from '../lib/types';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');

  const latest = useQuery({
    queryKey: ['internships', 'home'],
    queryFn: () => api<Paged<Internship>>('/internships', { query: { limit: 6 } }),
  });
  const skills = useQuery({
    queryKey: ['popular-skills'],
    queryFn: () => api<{ skills: { name: string; count: number }[] }>('/internships/popular-skills'),
  });
  const companies = useQuery({ queryKey: ['companies'], queryFn: () => api<{ companies: Company[] }>('/companies') });

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (city) params.set('city', city);
    navigate(`/internships?${params}`);
  };

  return (
    <>
      <PageMetadata
        title="Internships for students in Pakistan | WorkNest"
        description="Find and apply to paid internships at startups and companies across Pakistan and abroad. Track every application in one place."
      />
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-brand-100),transparent_55%)]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">
              Your first role starts <span className="text-brand-700">here</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">
              Find paid internships at startups and companies across Pakistan and abroad. Apply with one profile and track every application in one place.
            </p>
          </div>

          <form onSubmit={onSearch} className="mt-8 flex max-w-3xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/60 sm:flex-row">
            <label className="flex flex-1 items-center gap-2 px-3">
              <Search className="size-5 shrink-0 text-slate-400" />
              <span className="sr-only">Keywords</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Frontend, data, design, marketing…" className="h-12 w-full bg-transparent outline-none placeholder:text-slate-400" />
            </label>
            <div className="hidden w-px bg-slate-200 sm:block" />
            <label className="flex items-center gap-2 px-3 sm:w-52">
              <MapPin className="size-5 shrink-0 text-slate-400" />
              <span className="sr-only">City</span>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="h-12 w-full bg-transparent outline-none">
                <option value="">Anywhere</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <Button type="submit" size="lg">Search internships</Button>
          </form>

          {skills.data && skills.data.skills.length > 0 && (
            <div className="mt-5 flex max-w-3xl flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500">Popular:</span>
              {skills.data.skills.slice(0, 8).map((s) => (
                <Link key={s.name} to={`/internships?skill=${encodeURIComponent(s.name)}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:border-brand-600 hover:text-brand-800">
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Latest internships</h2>
            <p className="mt-1 text-slate-600">Fresh roles from teams that are hiring now.</p>
          </div>
          <Link to="/internships" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:underline sm:flex">
            See all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.isLoading && <Spinner />}
          {latest.data?.items.map((i) => <InternshipCard key={i._id} internship={i} />)}
        </div>
        <ButtonLink to="/internships" variant="secondary" className="mt-6 w-full sm:hidden">See all internships</ButtonLink>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight">How it works</h2>
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
            <h2 className="text-2xl font-extrabold tracking-tight">Companies hiring interns</h2>
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
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-ink px-6 py-10 text-white sm:flex-row sm:items-center sm:px-10">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Hiring interns?</h2>
              <p className="mt-2 max-w-xl text-slate-300">Post a role for free, review applicants in one place and message candidates directly.</p>
            </div>
            <ButtonLink to={user?.role === 'employer' ? '/employer/internships/new' : '/signup?role=employer'} size="lg" className="bg-white text-ink hover:bg-slate-100">
              Post an internship
            </ButtonLink>
          </div>
        </section>
      )}
    </>
  );
}
