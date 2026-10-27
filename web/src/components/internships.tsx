import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { fetchProfile } from '../lib/profile';
import { MODE_LABEL, deadlineLabel, formatDuration, formatLocation, formatPay, timeAgo } from '../lib/format';
import { toastError } from '../lib/forms';
import type { Internship } from '../lib/types';
import { Avatar, Badge, Button, ButtonLink, Chip, CompanyName, Modal, Spinner, Textarea, cx } from './ui';

/** Wide, single-column listing card: description teaser, a row of key numbers, and a call to action. */
export function InternshipRow({ internship: i }: { internship: Internship }) {
  const company = i.company;
  const stats: [string, string][] = [
    [formatPay(i), 'stipend'],
    [formatDuration(i.durationWeeks), 'duration'],
    [i.mode === 'remote' ? 'Remote' : i.city, i.mode === 'remote' ? 'location' : MODE_LABEL[i.mode].toLowerCase()],
    [String(i.applicationCount), i.applicationCount === 1 ? 'applicant' : 'applicants'],
  ];

  return (
    <div className="relative">
    <Link to={`/internships/${i._id}`} className="group block rounded-2xl border border-slate-300 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:px-10 sm:py-8">
      <div className="flex items-center gap-3 pr-10">
        <Avatar name={company?.name ?? '?'} src={company?.logoUrl} square />
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug text-ink group-hover:underline">{i.title}</h3>
          <p className="text-sm text-slate-600">{company && <CompanyName name={company.name} verified={company.verified} />}</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-1 text-slate-500">{i.description}</p>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:gap-x-8">
          {stats.map(([value, label]) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd className="font-bold text-ink">{value}</dd>
              <dd className="text-sm text-slate-500" aria-hidden>{label}</dd>
            </div>
          ))}
        </dl>
        <span
          className={cx(
            'shrink-0 rounded-full border px-5 py-2.5 font-semibold transition-colors',
            i.applicationId ? 'border-brand-600 text-brand-700' : 'border-ink text-ink group-hover:bg-ink group-hover:text-white',
          )}
        >
          {i.applicationId ? 'Applied' : 'Apply now'}
        </span>
      </div>
    </Link>
    <BookmarkButton internship={i} className="absolute right-4 top-4 sm:right-6 sm:top-6" />
    </div>
  );
}

export function InternshipCard({ internship: i, active, onSelect }: { internship: Internship; active?: boolean; onSelect?: () => void }) {
  const company = i.company;
  const deadline = deadlineLabel(i.deadline);
  const content = (
    <>
      <div className="flex gap-3">
        <Avatar name={company?.name ?? '?'} src={company?.logoUrl} square />
        {/* pr-8 leaves room for the bookmark in the corner. */}
        <div className="min-w-0 flex-1 pr-8">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold leading-snug text-ink group-hover:text-brand-800">{i.title}</h3>
            {i.applicationId && <Badge tone="green" className="shrink-0">Applied</Badge>}
          </div>
          <p className="mt-0.5 text-sm text-slate-600">{company && <CompanyName name={company.name} verified={company.verified} />}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-slate-400" />{formatLocation(i)}</span>
        <span className={cx('inline-flex items-center gap-1.5', i.paid ? 'font-semibold text-brand-800' : '')}>
          <Wallet className="size-4 text-slate-400" />{formatPay(i)}
        </span>
        <span className="inline-flex items-center gap-1.5"><Clock className="size-4 text-slate-400" />{formatDuration(i.durationWeeks)}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {i.skills.slice(0, 4).map((s) => <Chip key={s}>{s}</Chip>)}
        {i.skills.length > 4 && <span className="text-xs text-slate-500">+{i.skills.length - 4}</span>}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          {i.publishedAt && `Posted ${timeAgo(i.publishedAt)}`}
          {deadline && <span className={cx('ml-2', deadline.startsWith('Closes') && 'font-semibold text-amber-700')}>· {deadline}</span>}
        </p>
        {i.acceptingApplications && !i.applicationId && (
          <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700">
            <Zap className="size-3.5 fill-current" aria-hidden /> Quick apply
          </span>
        )}
      </div>
    </>
  );

  const cls = cx(
    'group block w-full rounded-xl border bg-white p-4 text-left transition-all',
    active ? 'border-brand-600 ring-2 ring-brand-600/20' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm',
  );

  return (
    <div className="relative">
      {onSelect ? (
        <button type="button" onClick={onSelect} className={cls} aria-pressed={active}>
          {content}
        </button>
      ) : (
        <Link to={`/internships/${i._id}`} className={cls}>
          {content}
        </Link>
      )}
      <BookmarkButton internship={i} className="absolute right-2 top-2" />
    </div>
  );
}

/**
 * Save/unsave for the bookmark icon and the Save button. Visitors who aren't signed in are sent to
 * log in; employers get `hidden` because only students can save.
 */
function useSaveToggle(internship: Internship) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  // The optimistic value, kept until the refetched lists agree so the icon doesn't flicker back.
  const [pending, setPending] = useState<boolean>();
  const saved = pending ?? !!internship.saved;

  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ['internships'] }),
      qc.invalidateQueries({ queryKey: ['internship', internship._id] }),
      qc.invalidateQueries({ queryKey: ['saved'] }),
    ]);
  const request = (next: boolean) => api(`/internships/${internship._id}/save`, { method: next ? 'POST' : 'DELETE' });

  const mutation = useMutation({
    mutationFn: request,
    onMutate: (next) => setPending(next),
    onError: (err) => {
      setPending(undefined);
      toastError(err);
    },
    onSuccess: (_d, next) => {
      if (next) {
        toast.success('Saved', { action: { label: 'View saved', onClick: () => navigate('/saved') } });
      } else {
        // Undo can run after this card has gone (e.g. on the Saved page), so it doesn't use the mutation.
        toast.success('Removed from saved', { action: { label: 'Undo', onClick: () => request(true).then(refresh, toastError) } });
      }
    },
    onSettled: () => refresh().finally(() => setPending(undefined)),
  });

  const toggle = () => {
    if (!user) return navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
    if (!mutation.isPending) mutation.mutate(!saved);
  };
  return { saved, toggle, hidden: !!user && user.role !== 'student' };
}

export function SaveButton({ internship }: { internship: Internship }) {
  const { saved, toggle, hidden } = useSaveToggle(internship);
  if (hidden) return null;
  return (
    <Button variant="secondary" onClick={toggle} aria-pressed={saved}>
      {saved ? <BookmarkCheck className="size-4 text-brand-700" /> : <Bookmark className="size-4" />}
      {saved ? 'Saved' : 'Save'}
    </Button>
  );
}

/** Bookmark icon for the corner of a card. Rendered beside the card's link, not inside it. */
export function BookmarkButton({ internship, className }: { internship: Internship; className?: string }) {
  const { saved, toggle, hidden } = useSaveToggle(internship);
  if (hidden) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${internship.title} from saved` : `Save ${internship.title}`}
      title={saved ? 'Remove from saved' : 'Save internship'}
      className={cx(
        'rounded-full p-2 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
        saved ? 'text-brand-700' : 'text-slate-400 hover:text-brand-700',
        className,
      )}
    >
      <Bookmark className={cx('size-5', saved && 'fill-current')} strokeWidth={2} aria-hidden />
    </button>
  );
}

function ApplyAction({ internship }: { internship: Internship }) {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (internship.applicationId) {
    return (
      <ButtonLink to={`/applications/${internship.applicationId}`} variant="secondary">
        <CheckCircle2 className="size-4 text-brand-700" /> View application
      </ButtonLink>
    );
  }
  if (!internship.acceptingApplications) return <Button disabled>No longer accepting applications</Button>;
  if (!user) {
    return <ButtonLink to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}>Log in to apply</ButtonLink>;
  }
  if (user.role !== 'student') return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
      >
        <Zap className="size-4 fill-brand-500 text-brand-500" aria-hidden /> Apply now
      </button>
      {open && <ApplyDialog internship={internship} onClose={() => setOpen(false)} />}
    </>
  );
}

function ApplyDialog({ internship, onClose }: { internship: Internship; onClose: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const profile = useQuery({ queryKey: ['profile'], queryFn: fetchProfile });
  const { register, handleSubmit, formState } = useForm<{ coverLetter: string; answers: Record<string, string> }>({
    defaultValues: { coverLetter: '', answers: {} },
  });

  const apply = useMutation({
    mutationFn: (v: { coverLetter: string; answers: Record<string, string> }) =>
      api<{ application: { _id: string } }>(`/applications/apply/${internship._id}`, {
        method: 'POST',
        body: {
          coverLetter: v.coverLetter,
          answers: Object.entries(v.answers ?? {}).map(([questionId, answer]) => ({ questionId, answer })),
        },
      }),
    onSuccess: ({ application }) => {
      toast.success(`Application sent to ${internship.company?.name ?? 'the company'}`);
      qc.invalidateQueries({ queryKey: ['internships'] });
      qc.invalidateQueries({ queryKey: ['internship', internship._id] });
      qc.invalidateQueries({ queryKey: ['my-applications'] });
      onClose();
      navigate(`/applications/${application._id}`);
    },
    onError: toastError,
  });

  const resume = profile.data?.resume;
  const missingResume = profile.isSuccess && !resume;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Apply to ${internship.company?.name ?? 'this role'}`}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button form="apply-form" type="submit" loading={apply.isPending} disabled={missingResume || profile.isLoading}>
            Submit application
          </Button>
        </>
      }
    >
      <p className="mb-5 text-sm text-slate-600">
        <span className="font-semibold text-ink">{internship.title}</span> · {formatLocation(internship)}
      </p>

      {profile.isLoading ? (
        <Spinner />
      ) : missingResume ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Add your resume first</p>
          <p className="mt-1">Employers need a resume to review your application. It only takes a minute.</p>
          <Link to="/profile" className="mt-3 inline-block font-semibold text-amber-900 underline">Go to my profile</Link>
        </div>
      ) : (
        <form id="apply-form" onSubmit={handleSubmit((v) => apply.mutate(v))} className="space-y-5">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <FileText className="size-5 text-slate-500" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium">{resume?.fileName}</p>
              <p className="text-xs text-slate-500">Your current resume will be attached</p>
            </div>
            <Link to="/profile" className="text-sm font-semibold text-brand-700 hover:underline">Change</Link>
          </div>

          {internship.questions.map((q) => (
            <Textarea
              key={q._id}
              label={q.prompt}
              optional={!q.required}
              rows={3}
              error={formState.errors.answers?.[q._id]?.message}
              {...register(`answers.${q._id}`, { required: q.required ? 'This question is required' : false })}
            />
          ))}

          <Textarea
            label="Cover note"
            optional
            rows={5}
            placeholder="A few lines on why you're interested and what you'd bring."
            {...register('coverLetter', { maxLength: { value: 4000, message: 'Keep it under 4000 characters' } })}
            error={formState.errors.coverLetter?.message}
          />
        </form>
      )}
    </Modal>
  );
}

export function InternshipDetail({ internship: i, compact }: { internship: Internship; compact?: boolean }) {
  const company = i.company;
  const deadline = deadlineLabel(i.deadline);

  const facts = [
    { icon: MapPin, label: 'Location', value: formatLocation(i) },
    { icon: Wallet, label: 'Stipend', value: formatPay(i) },
    { icon: Clock, label: 'Duration', value: formatDuration(i.durationWeeks) },
    { icon: Users, label: 'Openings', value: `${i.openings} position${i.openings === 1 ? '' : 's'}` },
    ...(deadline ? [{ icon: CalendarDays, label: 'Deadline', value: deadline }] : []),
  ];

  return (
    <article>
      <div className="flex gap-4">
        <Avatar name={company?.name ?? '?'} src={company?.logoUrl} size="lg" square />
        <div className="min-w-0">
          {company && (
            <Link to={`/companies/${company.slug}`} className="text-sm font-semibold text-slate-600 hover:text-brand-800 hover:underline">
              <CompanyName name={company.name} verified={company.verified} />
            </Link>
          )}
          <h1 className={cx('font-extrabold leading-tight tracking-tight', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}>
            {compact ? <Link to={`/internships/${i._id}`} className="hover:underline">{i.title}</Link> : i.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {i.publishedAt && `Posted ${timeAgo(i.publishedAt)}`} · {i.applicationCount} applicant{i.applicationCount === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {i.status !== 'open' && (
        <div className="mt-4 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700">
          {i.status === 'draft' ? 'This is a draft. Only your team can see it.' : 'This internship is closed.'}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {i.isOwner ? (
          <>
            <ButtonLink to={`/employer/internships/${i._id}/applicants`}>View applicants</ButtonLink>
            <ButtonLink to={`/employer/internships/${i._id}/edit`} variant="secondary">Edit posting</ButtonLink>
          </>
        ) : (
          <>
            <ApplyAction internship={i} />
            <SaveButton key={i._id} internship={i} />
          </>
        )}
        {compact && (
          <ButtonLink to={`/internships/${i._id}`} variant="ghost" aria-label="Open in full page">
            <ExternalLink className="size-4" />
          </ButtonLink>
        )}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-brand-100 bg-brand-50/70 p-4 sm:grid-cols-3">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label}>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Icon className="size-3.5 text-brand-700" /> {label}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {i.skills.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Skills</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {i.skills.map((s) => (
              <Link key={s} to={`/internships?skill=${encodeURIComponent(s)}`} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm font-medium text-slate-700 hover:border-brand-600 hover:text-brand-800">
                {s}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">About the internship</h2>
        <div className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{i.description}</div>
      </section>

      {i.requirements.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">What we're looking for</h2>
          <ul className="mt-2 space-y-1.5">
            {i.requirements.map((r) => (
              <li key={r} className="flex gap-2 text-slate-700">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
                {r}
              </li>
            ))}
          </ul>
        </section>
      )}

      {company && (
        <section className="mt-8 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={company.name} src={company.logoUrl} square size="sm" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold"><CompanyName name={company.name} verified={company.verified} /></p>
              <p className="truncate text-sm text-slate-500">
                {[company.industry, company.city, company.size && `${company.size} people`].filter(Boolean).join(' · ')}
              </p>
            </div>
            <Link to={`/companies/${company.slug}`} className="text-sm font-semibold text-brand-700 hover:underline">View company</Link>
          </div>
          {company.tagline && <p className="mt-3 text-sm text-slate-600">{company.tagline}</p>}
        </section>
      )}
    </article>
  );
}
