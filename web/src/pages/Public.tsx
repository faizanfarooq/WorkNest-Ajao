import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, Globe, MapPin, Search, Users } from 'lucide-react';
import { InternshipCard, InternshipDetail } from '../components/internships';
import { Avatar, ButtonLink, Card, CompanyName, EmptyState, ErrorState, PageHeader, PageSpinner } from '../components/ui';
import { ApiError, api } from '../lib/api';
import { formatDate } from '../lib/format';
import type { Company, Internship } from '../lib/types';

export function InternshipPage() {
  const { id } = useParams();
  const q = useQuery({
    queryKey: ['internship', id],
    queryFn: () => api<{ internship: Internship }>(`/internships/${id}`).then((r) => r.internship),
  });

  if (q.isLoading) return <PageSpinner />;
  if (q.error instanceof ApiError && q.error.status === 404) return <NotFound what="internship" />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <Link to="/internships" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-ink">
        <ArrowLeft className="size-4" /> All internships
      </Link>
      <Card className="p-5 sm:p-8">
        <InternshipDetail internship={q.data!} />
      </Card>
    </div>
  );
}

export function CompaniesPage() {
  const [q, setQ] = useState('');
  const list = useQuery({
    queryKey: ['companies', q],
    queryFn: () => api<{ companies: Company[] }>('/companies', { query: { q } }),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader title="Companies" subtitle="Startups and teams hiring interns on WorkNest." />
      <label className="mb-6 flex max-w-md items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 shadow-sm focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/30">
        <Search className="size-4 text-slate-400" />
        <span className="sr-only">Search companies</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies" className="h-10 w-full bg-transparent text-sm outline-none" />
      </label>
      {list.isLoading && <PageSpinner />}
      {list.isError && <ErrorState error={list.error} retry={() => list.refetch()} />}
      {list.data?.companies.length === 0 && <EmptyState icon={<Building2 className="size-6" />} title="No companies found" />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.data?.companies.map((c) => (
          <Link key={c._id} to={`/companies/${c.slug}`} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:border-slate-300 hover:shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar name={c.name} src={c.logoUrl} square />
              <div className="min-w-0">
                <p className="font-bold"><CompanyName name={c.name} verified={c.verified} /></p>
                <p className="text-sm text-slate-500">{[c.industry, c.city].filter(Boolean).join(' · ')}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-600">{c.tagline || c.about}</p>
            <p className="mt-4 text-sm font-semibold text-brand-700">{c.openRoles ? `${c.openRoles} open internship${c.openRoles === 1 ? '' : 's'}` : 'No open roles right now'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CompanyPage() {
  const { slug } = useParams();
  const q = useQuery({
    queryKey: ['company', slug],
    queryFn: () => api<{ company: Company; internships: Internship[] }>(`/companies/${slug}`),
  });

  if (q.isLoading) return <PageSpinner />;
  if (q.error instanceof ApiError && q.error.status === 404) return <NotFound what="company" />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const { company: c, internships } = q.data!;

  return (
    <>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar name={c.name} src={c.logoUrl} size="xl" square />
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight"><CompanyName name={c.name} verified={c.verified} /></h1>
              {c.tagline && <p className="mt-1 text-lg text-slate-600">{c.tagline}</p>}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                {c.industry && <span className="inline-flex items-center gap-1.5"><Building2 className="size-4 text-slate-400" />{c.industry}</span>}
                {c.city && <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-slate-400" />{c.city}</span>}
                {c.size && <span className="inline-flex items-center gap-1.5"><Users className="size-4 text-slate-400" />{c.size} people</span>}
                {c.website && (
                  <a href={c.website} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
                    <Globe className="size-4" />Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="text-xl font-extrabold">Open internships ({internships.length})</h2>
          <div className="mt-4 space-y-3">
            {internships.length === 0 && <Card><EmptyState title="No open internships right now" body="Check back soon." /></Card>}
            {internships.map((i) => <InternshipCard key={i._id} internship={i} />)}
          </div>
        </section>
        <aside>
          <h2 className="text-xl font-extrabold">About</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{c.about || 'This company has not added a description yet.'}</p>
          <p className="mt-4 text-xs text-slate-400">On WorkNest since {formatDate(c.createdAt)}</p>
        </aside>
      </div>
    </>
  );
}

export function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-700">404</p>
      <h1 className="mt-4 text-2xl font-extrabold">We couldn't find that {what}</h1>
      <p className="mt-2 text-slate-600">It may have been removed, or the link is wrong.</p>
      <ButtonLink to="/internships" className="mt-6">Browse internships</ButtonLink>
    </div>
  );
}
