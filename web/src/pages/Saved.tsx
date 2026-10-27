import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { Bookmark } from 'lucide-react';
import { InternshipCard } from '../components/internships';
import { PageMetadata } from '../components/PageMetadata';
import { ButtonLink, Card, EmptyState, ErrorState, PageHeader, PageSpinner, cx } from '../components/ui';
import { api } from '../lib/api';
import type { Internship } from '../lib/types';

type Filter = 'all' | 'open' | 'closed';

/** Every internship the student bookmarked, newest first. Unsaving from a card removes it here. */
export default function SavedPage() {
  const [params, setParams] = useSearchParams();
  const filter: Filter = params.get('show') === 'open' ? 'open' : params.get('show') === 'closed' ? 'closed' : 'all';
  const saved = useQuery({ queryKey: ['saved'], queryFn: () => api<{ items: Internship[] }>('/internships/saved') });

  const items = saved.data?.items ?? [];
  const open = items.filter((i) => i.acceptingApplications);
  const closed = items.filter((i) => !i.acceptingApplications);
  const shown = filter === 'open' ? open : filter === 'closed' ? closed : items;

  const tabs = [
    ['all', `All (${items.length})`],
    ['open', `Accepting applications (${open.length})`],
    ['closed', `Closed (${closed.length})`],
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <PageMetadata title="Saved internships | WorkNest" description="The internships you bookmarked on WorkNest." />
      <PageHeader
        title="Saved internships"
        subtitle="Internships you bookmarked. Tap the bookmark on a card to remove it."
        actions={<ButtonLink to="/internships">Find internships</ButtonLink>}
      />

      {saved.isLoading ? (
        <PageSpinner />
      ) : saved.isError ? (
        <Card><ErrorState error={saved.error} retry={() => saved.refetch()} /></Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bookmark className="size-6" />}
            title="Nothing saved yet"
            body="Tap the bookmark on any internship while you browse, and it will wait for you here."
            action={<ButtonLink to="/internships">Browse internships</ButtonLink>}
          />
        </Card>
      ) : (
        <>
          <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                onClick={() => setParams(key === 'all' ? {} : { show: key }, { replace: true })}
                className={cx(
                  '-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold',
                  filter === key ? 'border-brand-700 text-brand-800' : 'border-transparent text-slate-500 hover:text-ink',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {shown.length ? (
            <div className="grid gap-3 sm:grid-cols-2">{shown.map((i) => <InternshipCard key={i._id} internship={i} />)}</div>
          ) : (
            <Card>
              <EmptyState
                icon={<Bookmark className="size-6" />}
                title={filter === 'open' ? 'None of your saved internships are open' : 'No closed internships'}
                body={filter === 'open' ? 'The ones you saved have stopped taking applications.' : 'Saved internships that stop taking applications show up here.'}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
