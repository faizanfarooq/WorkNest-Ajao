import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, SearchX, X } from 'lucide-react';
import { InternshipCard, InternshipDetail } from '../components/internships';
import { InternshipsHero, type HeroChip } from '../components/InternshipsHero';
import { Button, Card, EmptyState, ErrorState, Spinner, cx } from '../components/ui';
import { api } from '../lib/api';
import type { Company, Internship, Paged } from '../lib/types';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

const FILTER_KEYS = ['q', 'city', 'mode', 'paid', 'skill', 'company', 'sort'] as const;

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
        active ? 'bg-brand-700 text-white hover:bg-brand-800' : 'bg-slate-200/70 text-ink hover:bg-slate-300/70',
      )}
    >
      {children}
    </button>
  );
}

export default function InternshipsPage() {
  const [params, setParams] = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) ?? ''])) as Record<(typeof FILTER_KEYS)[number], string>;
  const page = Number(params.get('page') ?? 1);
  const selectedId = params.get('id');

  const [keywords, setKeywords] = useState(filters.q);
  const [city, setCity] = useState(filters.city);
  useEffect(() => {
    setKeywords(filters.q);
    setCity(filters.city);
  }, [filters.q, filters.city]);

  const update = (patch: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k);
    if (!keepPage) next.delete('page');
    if (!('id' in patch)) next.delete('id');
    setParams(next, { replace: 'id' in patch && Object.keys(patch).length === 1 });
  };

  const list = useQuery({
    queryKey: ['internships', filters, page],
    queryFn: () => api<Paged<Internship>>('/internships', { query: { ...filters, page, limit: 15 } }),
    placeholderData: keepPreviousData,
  });

  const items = list.data?.items ?? [];
  const activeId = isDesktop ? (selectedId ?? items[0]?._id) : null;

  const detail = useQuery({
    queryKey: ['internship', activeId],
    queryFn: () => api<{ internship: Internship }>(`/internships/${activeId}`).then((r) => r.internship),
    enabled: !!activeId,
  });

  // Hero stats and phone mockup: the unfiltered totals and newest roles.
  const overview = useQuery({
    queryKey: ['internships', 'overview'],
    queryFn: () => api<Paged<Internship>>('/internships', { query: { limit: 3 } }),
  });
  const companies = useQuery({ queryKey: ['companies'], queryFn: () => api<{ companies: Company[] }>('/companies') });

  const results = useRef<HTMLDivElement>(null);
  const showResults = () =>
    results.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    update({ q: keywords.trim() || null, city: city || null });
    showResults();
  };

  // Hero chips are shortcuts for the same URL filters as the pills below.
  const chip = (label: string, key: 'mode' | 'paid' | 'skill', value: string): HeroChip => ({
    label,
    active: filters[key] === value,
    onToggle: () => update({ [key]: filters[key] === value ? null : value }),
  });
  const chips = [
    chip('Remote', 'mode', 'remote'),
    chip('Paid', 'paid', 'true'),
    chip('Hybrid', 'mode', 'hybrid'),
    chip('Figma', 'skill', 'Figma'),
    chip('Node.js', 'skill', 'Node.js'),
    chip('PostgreSQL', 'skill', 'PostgreSQL'),
  ];

  const activeFilterCount = ['mode', 'paid', 'skill', 'company'].filter((k) => params.get(k)).length;

  return (
    <>
    <InternshipsHero
      keywords={keywords}
      city={city}
      onKeywords={setKeywords}
      onCity={setCity}
      onSearch={onSearch}
      chips={chips}
      stats={{ internships: overview.data?.total, companies: companies.data?.companies.length }}
      latest={overview.data?.items ?? []}
    />

    <div ref={results} className="mx-auto max-w-7xl scroll-mt-20 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <Pill active={filters.mode === 'remote'} onClick={() => update({ mode: filters.mode === 'remote' ? null : 'remote' })}>Remote</Pill>
        <Pill active={filters.mode === 'hybrid'} onClick={() => update({ mode: filters.mode === 'hybrid' ? null : 'hybrid' })}>Hybrid</Pill>
        <Pill active={filters.mode === 'onsite'} onClick={() => update({ mode: filters.mode === 'onsite' ? null : 'onsite' })}>On-site</Pill>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <Pill active={filters.paid === 'true'} onClick={() => update({ paid: filters.paid === 'true' ? null : 'true' })}>Paid only</Pill>
        {filters.skill && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-800">
            Skill: {filters.skill}
            <button onClick={() => update({ skill: null })} aria-label="Clear skill filter"><X className="size-4" /></button>
          </span>
        )}
        {filters.company && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-800">
            Company: {filters.company}
            <button onClick={() => update({ company: null })} aria-label="Clear company filter"><X className="size-4" /></button>
          </span>
        )}
        {(activeFilterCount > 0 || filters.q || filters.city) && (
          <button onClick={() => setParams({})} className="text-sm font-semibold text-slate-500 hover:text-ink">Clear all</button>
        )}
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
          Sort
          <select value={filters.sort || 'recent'} onChange={(e) => update({ sort: e.target.value === 'recent' ? null : e.target.value })} className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-medium text-ink">
            <option value="recent">{filters.q ? 'Most relevant' : 'Most recent'}</option>
            <option value="pay">Highest stipend</option>
            <option value="deadline">Closing soon</option>
          </select>
        </label>
      </div>

      <p className="mt-5 text-sm text-slate-600" aria-live="polite">
        {list.data ? (
          <>
            <span className="font-semibold text-ink">{list.data.total}</span> internship{list.data.total === 1 ? '' : 's'}
            {filters.q && <> for “{filters.q}”</>}
            {filters.city && <> in {filters.city}</>}
          </>
        ) : (
          ' '
        )}
      </p>

      <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className={cx('space-y-3', list.isPlaceholderData && 'opacity-60')}>
          {list.isLoading && <div className="flex justify-center py-16"><Spinner /></div>}
          {list.isError && <ErrorState error={list.error} retry={() => list.refetch()} />}
          {list.isSuccess && items.length === 0 && (
            <Card>
              <EmptyState
                icon={<SearchX className="size-6" />}
                title="No internships match"
                body="Try fewer filters, a broader keyword or a different city."
                action={<Button variant="secondary" onClick={() => setParams({})}>Clear filters</Button>}
              />
            </Card>
          )}
          {items.map((i) => (
            <InternshipCard key={i._id} internship={i} active={i._id === activeId} onSelect={isDesktop ? () => update({ id: i._id }, true) : undefined} />
          ))}
          {list.data && list.data.pages > 1 && (
            <nav className="flex items-center justify-between pt-2" aria-label="Pagination">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) }, true)}>
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <span className="text-sm text-slate-600">Page {page} of {list.data.pages}</span>
              <Button variant="secondary" size="sm" disabled={page >= list.data.pages} onClick={() => update({ page: String(page + 1) }, true)}>
                Next <ChevronRight className="size-4" />
              </Button>
            </nav>
          )}
        </div>

        {isDesktop && (
          <div className="hidden lg:block">
            <Card className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-6">
              {detail.isLoading && <div className="flex justify-center py-16"><Spinner /></div>}
              {detail.data && <InternshipDetail internship={detail.data} compact />}
              {!activeId && list.isSuccess && <p className="py-16 text-center text-sm text-slate-500">Select an internship to see the details.</p>}
            </Card>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
