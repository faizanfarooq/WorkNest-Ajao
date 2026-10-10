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
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { deadlineLabel, formatDuration, formatLocation, formatPay, timeAgo } from '../lib/format';
import { toastError } from '../lib/forms';
import type { Internship, StudentProfile } from '../lib/types';
import { Avatar, Badge, Button, ButtonLink, Chip, CompanyName, Modal, Spinner, Textarea, cx } from './ui';

export function InternshipCard({ internship: i, active, onSelect }: { internship: Internship; active?: boolean; onSelect?: () => void }) {
  const company = i.company;
  const deadline = deadlineLabel(i.deadline);
  const content = (
    <>
      <div className="flex gap-3">
        <Avatar name={company?.name ?? '?'} src={company?.logoUrl} square />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold leading-snug text-ink group-hover:text-brand-800">{i.title}</h3>
            {i.applicationId ? (
              <Badge tone="green" className="shrink-0">Applied</Badge>
            ) : i.saved ? (
              <BookmarkCheck className="size-4 shrink-0 text-brand-700" aria-label="Saved" />
            ) : null}
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
      <p className="mt-3 text-xs text-slate-500">
        {i.publishedAt && `Posted ${timeAgo(i.publishedAt)}`}
        {deadline && <span className={cx('ml-2', deadline.startsWith('Closes') && 'font-semibold text-amber-700')}>· {deadline}</span>}
      </p>
    </>
  );

  const cls = cx(
    'group block w-full rounded-xl border bg-white p-4 text-left transition-all',
    active ? 'border-brand-600 ring-2 ring-brand-600/20' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm',
  );

  return onSelect ? (
    <button type="button" onClick={onSelect} className={cls} aria-pressed={active}>
      {content}
    </button>
  ) : (
    <Link to={`/internships/${i._id}`} className={cls}>
      {content}
    </Link>
  );
}

export function SaveButton({ internship }: { internship: Internship }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(!!internship.saved);

  const toggle = useMutation({
    mutationFn: (next: boolean) => api(`/internships/${internship._id}/save`, { method: next ? 'POST' : 'DELETE' }),
    onMutate: (next) => setSaved(next),
    onError: (err, next) => {
      setSaved(!next);
      toastError(err);
    },
    onSuccess: (_d, next) => {
      toast.success(next ? 'Saved' : 'Removed from saved');
      qc.invalidateQueries({ queryKey: ['internships'] });
      qc.invalidateQueries({ queryKey: ['saved'] });
    },
  });

  if (user && user.role !== 'student') return null;
  return (
    <Button
      variant="secondary"
      onClick={() => (user ? toggle.mutate(!saved) : navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`))}
      aria-pressed={saved}
    >
      {saved ? <BookmarkCheck className="size-4 text-brand-700" /> : <Bookmark className="size-4" />}
      {saved ? 'Saved' : 'Save'}
    </Button>
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
      <Button onClick={() => setOpen(true)}>Apply now</Button>
      {open && <ApplyDialog internship={internship} onClose={() => setOpen(false)} />}
    </>
  );
}

function ApplyDialog({ internship, onClose }: { internship: Internship; onClose: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const profile = useQuery({ queryKey: ['profile'], queryFn: () => api<{ profile: StudentProfile }>('/profile/me') });
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

  const resume = profile.data?.profile.resume;
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
            <SaveButton key={`${i._id}-${i.saved}`} internship={i} />
          </>
        )}
        {compact && (
          <ButtonLink to={`/internships/${i._id}`} variant="ghost" aria-label="Open in full page">
            <ExternalLink className="size-4" />
          </ButtonLink>
        )}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-3">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label}>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Icon className="size-3.5" /> {label}
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
