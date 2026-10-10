import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Briefcase, Eye, FileText, Link2, MessageSquare, MoreHorizontal, Plus, Trash2, Users } from 'lucide-react';
import {
  CITIES,
  COMPANY_SIZES,
  CompanySchema,
  EMPLOYER_STATUSES,
  InternshipSchema,
  type ApplicationStatus,
  type CompanyInput,
  type InternshipInput,
} from '@shared/schemas';
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  Checkbox,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  PageSpinner,
  Select,
  TagInput,
  Textarea,
  cx,
} from '../components/ui';
import { ApiError, api, openProtectedFile } from '../lib/api';
import { useAuth } from '../lib/auth';
import { STATUS_META, formatDate, formatLocation, formatPay, timeAgo } from '../lib/format';
import { applyServerErrors, toastError } from '../lib/forms';
import type { Application, Company, Internship } from '../lib/types';
import { NotFound } from './Public';
import { StatusBadge } from './student';

// ---------- Dashboard ----------

export function EmployerDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['my-internships'], queryFn: () => api<{ items: Internship[] }>('/internships/mine') });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api(`/internships/${id}/status`, { method: 'PATCH', body: { status } }),
    onSuccess: (_d, v) => {
      toast.success(v.status === 'closed' ? 'Posting closed' : 'Posting is live');
      qc.invalidateQueries({ queryKey: ['my-internships'] });
      qc.invalidateQueries({ queryKey: ['internships'] });
    },
    onError: toastError,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/internships/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Posting deleted');
      qc.invalidateQueries({ queryKey: ['my-internships'] });
    },
    onError: toastError,
  });

  const items = q.data?.items ?? [];
  const sum = (s: ApplicationStatus) => items.reduce((n, i) => n + (i.statusCounts?.[s] ?? 0), 0);
  const totals = [
    { label: 'Open postings', value: items.filter((i) => i.status === 'open').length },
    { label: 'New applicants', value: sum('applied') },
    { label: 'In interview', value: sum('interview') },
    { label: 'Hired', value: sum('hired') },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title={user?.company?.name ?? 'Dashboard'}
        subtitle="Manage your internship postings and applicants."
        actions={
          <>
            {user?.company && <ButtonLink to={`/companies/${user.company.slug}`} variant="secondary">View public page</ButtonLink>}
            <ButtonLink to="/employer/internships/new"><Plus className="size-4" /> Post internship</ButtonLink>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {totals.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="text-2xl font-extrabold">{t.value}</p>
            <p className="text-sm text-slate-500">{t.label}</p>
          </Card>
        ))}
      </div>

      {q.isLoading ? (
        <PageSpinner />
      ) : q.isError ? (
        <ErrorState error={q.error} retry={() => q.refetch()} />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Briefcase className="size-6" />}
            title="Post your first internship"
            body="It takes about five minutes. Students can apply as soon as it's live."
            action={<ButtonLink to="/employer/internships/new">Post an internship</ButtonLink>}
          />
        </Card>
      ) : (
        <Card className="divide-y divide-slate-100">
          {items.map((i) => {
            const total = Object.values(i.statusCounts ?? {}).reduce((a, b) => a + (b ?? 0), 0);
            const fresh = i.statusCounts?.applied ?? 0;
            return (
              <div key={i._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/employer/internships/${i._id}/applicants`} className="truncate font-bold hover:underline">{i.title}</Link>
                    <Badge tone={i.status === 'open' ? 'green' : i.status === 'draft' ? 'amber' : 'slate'}>
                      {i.status === 'open' ? (i.acceptingApplications ? 'Live' : 'Deadline passed') : i.status === 'draft' ? 'Draft' : 'Closed'}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {formatLocation(i)} · {formatPay(i)} · {i.publishedAt ? `Posted ${formatDate(i.publishedAt)}` : `Created ${formatDate(i.createdAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-5 text-sm">
                  <span className="flex items-center gap-1.5 text-slate-500" title="Views"><Eye className="size-4" />{i.viewCount ?? 0}</span>
                  <Link to={`/employer/internships/${i._id}/applicants`} className="flex items-center gap-1.5 font-semibold text-ink hover:text-brand-800">
                    <Users className="size-4" />{total}
                    {fresh > 0 && <Badge tone="blue">{fresh} new</Badge>}
                  </Link>
                  <RowMenu
                    internship={i}
                    hasApplicants={total > 0}
                    onStatus={(status) => setStatus.mutate({ id: i._id, status })}
                    onDelete={() => confirm('Delete this posting permanently?') && remove.mutate(i._id)}
                  />
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

function RowMenu({ internship: i, hasApplicants, onStatus, onDelete }: { internship: Internship; hasApplicants: boolean; onStatus: (s: string) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const item = 'block w-full px-4 py-2 text-left text-sm hover:bg-slate-50';
  return (
    <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button onClick={() => setOpen((o) => !o)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Posting actions">
        <MoreHorizontal className="size-5" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <Link to={`/employer/internships/${i._id}/applicants`} className={item}>Applicants</Link>
          <Link to={`/internships/${i._id}`} className={item}>View posting</Link>
          <Link to={`/employer/internships/${i._id}/edit`} className={item}>Edit</Link>
          {i.status !== 'open' && <button className={item} onClick={() => onStatus('open')}>{i.status === 'draft' ? 'Publish' : 'Reopen'}</button>}
          {i.status === 'open' && <button className={item} onClick={() => onStatus('closed')}>Close posting</button>}
          {!hasApplicants && <button className={cx(item, 'text-red-700')} onClick={onDelete}>Delete</button>}
        </div>
      )}
    </div>
  );
}

// ---------- Create / edit posting ----------

type FormValues = Omit<InternshipInput, 'deadline' | 'requirements'> & { deadline?: string; requirements: { value: string }[] };

const blank: FormValues = {
  title: '',
  description: '',
  requirements: [{ value: '' }],
  skills: [],
  city: '',
  mode: 'onsite',
  paid: true,
  payAmount: 0,
  payCurrency: 'PKR',
  payPeriod: 'month',
  durationWeeks: 12,
  openings: 1,
  deadline: '',
  questions: [],
  status: 'open',
};

export function InternshipFormPage() {
  const { id } = useParams();
  const existing = useQuery({
    queryKey: ['internship', id],
    queryFn: () => api<{ internship: Internship }>(`/internships/${id}`).then((r) => r.internship),
    enabled: !!id,
  });
  if (id && existing.isLoading) return <PageSpinner />;
  if (id && (existing.isError || !existing.data?.isOwner)) return <NotFound what="posting" />;

  const i = existing.data;
  const initial: FormValues = i
    ? {
        ...blank,
        ...i,
        status: i.status === 'draft' ? 'draft' : 'open',
        requirements: i.requirements.length ? i.requirements.map((value) => ({ value })) : [{ value: '' }],
        deadline: i.deadline ? i.deadline.slice(0, 10) : '',
        questions: i.questions.map((q) => ({ _id: q._id, prompt: q.prompt, required: q.required })),
      }
    : blank;

  return <InternshipForm id={id} initial={initial} wasClosed={i?.status === 'closed'} />;
}

function InternshipForm({ id, initial, wasClosed }: { id?: string; initial: FormValues; wasClosed?: boolean }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const form = useForm<FormValues>({ defaultValues: initial });
  const { errors, isSubmitting } = form.formState;
  const requirements = useFieldArray({ control: form.control, name: 'requirements' });
  const questions = useFieldArray({ control: form.control, name: 'questions' });
  const paid = form.watch('paid');
  const mode = form.watch('mode');

  const submit = (status: 'open' | 'draft') =>
    form.handleSubmit(async (v) => {
      const body = {
        ...v,
        status,
        payAmount: v.paid ? Number(v.payAmount) : 0,
        requirements: v.requirements.map((r) => r.value.trim()).filter(Boolean),
        deadline: v.deadline || undefined,
      };
      // Validate with the shared schema so errors show inline before the round trip.
      const parsed = InternshipSchema.safeParse(body);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) form.setError(issue.path.join('.') as never, { message: issue.message });
        return;
      }
      try {
        const { internship } = await api<{ internship: Internship }>(id ? `/internships/${id}` : '/internships', {
          method: id ? 'PUT' : 'POST',
          body,
        });
        qc.invalidateQueries({ queryKey: ['my-internships'] });
        qc.invalidateQueries({ queryKey: ['internships'] });
        qc.invalidateQueries({ queryKey: ['internship', internship._id] });
        toast.success(id ? 'Changes saved' : status === 'open' ? 'Your internship is live' : 'Draft saved');
        navigate('/dashboard');
      } catch (err) {
        applyServerErrors(err, form.setError);
      }
    })();

  const num = { valueAsNumber: true };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/dashboard" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-ink">
        <ArrowLeft className="size-4" /> Dashboard
      </Link>
      <PageHeader title={id ? 'Edit internship' : 'Post an internship'} subtitle="Clear titles and visible pay get more applicants." />
      {wasClosed && <p className="mb-5 rounded-lg bg-slate-100 px-4 py-3 text-sm">This posting is closed. Saving keeps it closed; reopen it from your dashboard.</p>}

      <form onSubmit={(e) => { e.preventDefault(); submit('open'); }} className="space-y-6" noValidate>
        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="font-bold">The role</h2>
          <Input label="Title" placeholder="e.g. Frontend Engineering Intern (React)" error={errors.title?.message} {...form.register('title')} />
          <Textarea label="Description" rows={8} placeholder="What will the intern work on? Who will they work with? What will they learn?" error={errors.description?.message} {...form.register('description')} />
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Requirements</p>
            {requirements.fields.map((f, n) => (
              <div key={f.id} className="flex gap-2">
                <input className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30" placeholder="e.g. Comfortable with JavaScript" {...form.register(`requirements.${n}.value`)} />
                <Button variant="ghost" onClick={() => requirements.remove(n)} aria-label="Remove requirement"><Trash2 className="size-4" /></Button>
              </div>
            ))}
            {requirements.fields.length < 20 && (
              <Button variant="ghost" size="sm" onClick={() => requirements.append({ value: '' })}><Plus className="size-4" /> Add requirement</Button>
            )}
          </div>
          <Controller
            control={form.control}
            name="skills"
            render={({ field, fieldState }) => <TagInput label="Skills" value={field.value} onChange={field.onChange} placeholder="React, SQL, Figma…" error={fieldState.error?.message} />}
          />
        </Card>

        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="font-bold">Where and how long</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Work mode" {...form.register('mode')}>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </Select>
            <Select label="City" optional={mode === 'remote'} error={errors.city?.message} {...form.register('city')}>
              <option value="">{mode === 'remote' ? 'Anywhere' : 'Select a city'}</option>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Input label="Duration (weeks)" type="number" min={1} max={52} error={errors.durationWeeks?.message} {...form.register('durationWeeks', num)} />
            <Input label="Openings" type="number" min={1} max={100} error={errors.openings?.message} {...form.register('openings', num)} />
            <Input label="Application deadline" type="date" optional error={errors.deadline?.message} {...form.register('deadline')} />
          </div>
        </Card>

        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="font-bold">Stipend</h2>
          <Checkbox label="This is a paid internship" {...form.register('paid')} />
          {paid && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Amount" type="number" min={0} error={errors.payAmount?.message} {...form.register('payAmount', num)} />
              <Select label="Currency" {...form.register('payCurrency')}>
                <option value="PKR">PKR</option>
                <option value="USD">USD</option>
              </Select>
              <Select label="Per" {...form.register('payPeriod')}>
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="total">Total (whole internship)</option>
              </Select>
            </div>
          )}
        </Card>

        <Card className="space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="font-bold">Screening questions</h2>
            <p className="text-sm text-slate-500">Up to 5 short questions applicants answer when they apply.</p>
          </div>
          {questions.fields.map((f, n) => (
            <div key={f.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input aria-label={`Question ${n + 1}`} placeholder="e.g. Link a project you're proud of" error={errors.questions?.[n]?.prompt?.message} {...form.register(`questions.${n}.prompt`)} />
                </div>
                <Button variant="ghost" onClick={() => questions.remove(n)} aria-label="Remove question"><Trash2 className="size-4" /></Button>
              </div>
              <Checkbox label="Required" {...form.register(`questions.${n}.required`)} />
            </div>
          ))}
          {questions.fields.length < 5 && (
            <Button variant="secondary" size="sm" onClick={() => questions.append({ prompt: '', required: true })}><Plus className="size-4" /> Add question</Button>
          )}
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {(!id || initial.status === 'draft') && (
            <Button variant="secondary" size="lg" onClick={() => submit('draft')} disabled={isSubmitting}>Save as draft</Button>
          )}
          <Button type="submit" size="lg" loading={isSubmitting}>{id && initial.status === 'open' ? 'Save changes' : 'Publish internship'}</Button>
        </div>
      </form>
    </div>
  );
}

// ---------- Applicants ----------

const PIPELINE: ApplicationStatus[] = ['applied', 'reviewing', 'interview', 'offered', 'hired', 'rejected', 'withdrawn'];

export function ApplicantsPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const filter = params.get('status') as ApplicationStatus | null;
  const selectedId = params.get('app');

  const q = useQuery({
    queryKey: ['applicants', id],
    queryFn: () => api<{ internship: Pick<Internship, '_id' | 'title' | 'status'>; items: Application[] }>(`/applications/internship/${id}`),
  });

  if (q.isLoading) return <PageSpinner />;
  if (q.error instanceof ApiError && [403, 404].includes(q.error.status)) return <NotFound what="posting" />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;

  const { internship, items } = q.data!;
  const counts = Object.fromEntries(PIPELINE.map((s) => [s, items.filter((a) => a.status === s).length]));
  const visible = filter ? items.filter((a) => a.status === filter) : items.filter((a) => a.status !== 'withdrawn');
  const selected = items.find((a) => a._id === selectedId) ?? visible[0];

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k);
    setParams(next, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-ink">
        <ArrowLeft className="size-4" /> Dashboard
      </Link>
      <PageHeader
        title={internship.title}
        subtitle={`${items.length} applicant${items.length === 1 ? '' : 's'}`}
        actions={
          <>
            <ButtonLink to={`/internships/${internship._id}`} variant="secondary" size="sm">View posting</ButtonLink>
            <ButtonLink to={`/employer/internships/${internship._id}/edit`} variant="secondary" size="sm">Edit</ButtonLink>
          </>
        }
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => set({ status: null, app: null })} className={cx('shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold', !filter ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white')}>
          All active ({items.length - (counts.withdrawn ?? 0)})
        </button>
        {PIPELINE.map((s) => (
          <button key={s} onClick={() => set({ status: s, app: null })} className={cx('shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold', filter === s ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white text-slate-700')}>
            {STATUS_META[s].label} ({counts[s]})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card><EmptyState icon={<Users className="size-6" />} title="No applicants here yet" body={items.length ? 'Try another stage.' : 'Share your posting to get applicants.'} /></Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Card className="divide-y divide-slate-100 self-start overflow-hidden">
            {visible.map((a) => (
              <button
                key={a._id}
                onClick={() => set({ app: a._id })}
                className={cx('flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50', selected?._id === a._id && 'bg-brand-50/60')}
              >
                <Avatar name={a.student?.name ?? '?'} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{a.student?.name}</p>
                  <p className="truncate text-xs text-slate-500">{a.student?.headline || a.student?.university || a.student?.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={a.status} />
                  <span className="text-xs text-slate-400">{timeAgo(a.createdAt)}</span>
                </div>
              </button>
            ))}
          </Card>
          {selected && <ApplicantPanel key={selected._id} application={selected} internshipId={internship._id} />}
        </div>
      )}
    </div>
  );
}

function ApplicantPanel({ application: a, internshipId }: { application: Application; internshipId: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const s = a.student;
  const [status, setStatus] = useState<string>(EMPLOYER_STATUSES.includes(a.status as never) ? a.status : '');
  const [note, setNote] = useState('');
  useEffect(() => setStatus(EMPLOYER_STATUSES.includes(a.status as never) ? a.status : ''), [a.status]);

  const update = useMutation({
    mutationFn: () => api(`/applications/${a._id}/status`, { method: 'PATCH', body: { status, note: note.trim() || undefined } }),
    onSuccess: () => {
      toast.success('Status updated. The student has been notified.');
      setNote('');
      qc.invalidateQueries({ queryKey: ['applicants', internshipId] });
      qc.invalidateQueries({ queryKey: ['my-internships'] });
    },
    onError: toastError,
  });

  const message = useMutation({
    mutationFn: () => api<{ conversation: { _id: string } }>('/conversations', { method: 'POST', body: { applicationId: a._id } }),
    onSuccess: ({ conversation }) => navigate(`/messages/${conversation._id}`),
    onError: toastError,
  });

  if (!s) return null;
  const links = Object.entries(s.links ?? {}).filter(([, v]) => v);

  return (
    <Card className="self-start p-5 sm:p-6 lg:sticky lg:top-20">
      <div className="flex items-start gap-4">
        <Avatar name={s.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold">{s.name}</h2>
          {s.headline && <p className="text-slate-600">{s.headline}</p>}
          <p className="mt-1 text-sm text-slate-500">
            {[s.degree, s.university, s.graduationYear && `Class of ${s.graduationYear}`].filter(Boolean).join(' · ')}
          </p>
          <p className="text-sm text-slate-500">{[s.city, s.email].filter(Boolean).join(' · ')}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {a.resume && (
          <Button variant="secondary" size="sm" onClick={() => openProtectedFile(`/profile/resumes/${a.resume!.fileId}`).catch(toastError)}>
            <FileText className="size-4" /> Resume
          </Button>
        )}
        <Button size="sm" loading={message.isPending} onClick={() => message.mutate()}>
          <MessageSquare className="size-4" /> Message
        </Button>
        {links.map(([k, v]) => (
          <a key={k} href={v} target="_blank" rel="noreferrer noopener" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-semibold capitalize hover:bg-slate-50">
            <Link2 className="size-4" /> {k}
          </a>
        ))}
      </div>

      {a.status === 'withdrawn' ? (
        <p className="mt-5 rounded-lg bg-slate-100 px-4 py-3 text-sm">The student withdrew this application.</p>
      ) : (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold">Move to stage</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" aria-label="Stage">
              <option value="" disabled>Choose a stage</option>
              {EMPLOYER_STATUSES.map((st) => <option key={st} value={st}>{STATUS_META[st].label}</option>)}
            </select>
            <Button onClick={() => update.mutate()} loading={update.isPending} disabled={!status || (status === a.status && !note.trim())}>Update</Button>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Optional note to the student (e.g. interview time)"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
          />
        </div>
      )}

      {s.skills?.length > 0 && (
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">{s.skills.map((k) => <Badge key={k}>{k}</Badge>)}</div>
        </section>
      )}
      {s.gpa !== undefined && s.gpa !== null && (
        <p className="mt-4 text-sm"><span className="font-semibold">GPA:</span> {s.gpa.toFixed(2)}</p>
      )}
      {s.bio && (
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">About</h3>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{s.bio}</p>
        </section>
      )}
      {a.answers.map((ans) => (
        <section key={ans.questionId} className="mt-5">
          <h3 className="text-sm font-semibold">{ans.prompt}</h3>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{ans.answer || '—'}</p>
        </section>
      ))}
      {a.coverLetter && (
        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Cover note</h3>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{a.coverLetter}</p>
        </section>
      )}
      <section className="mt-5 border-t border-slate-100 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">History</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {a.history.map((h, n) => (
            <li key={n}>{STATUS_META[h.status].label} · {formatDate(h.at)}{h.note && <span className="text-slate-400"> — {h.note}</span>}</li>
          ))}
        </ul>
      </section>
    </Card>
  );
}

// ---------- Company settings ----------

export function CompanySettingsPage() {
  const [params] = useSearchParams();
  const q = useQuery({ queryKey: ['my-company'], queryFn: () => api<{ company: Company }>('/companies/mine').then((r) => r.company) });
  if (q.isLoading) return <PageSpinner />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {params.get('welcome') && (
        <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
          <p className="font-bold">Welcome to WorkNest!</p>
          <p className="mt-1">Tell students about your company, then post your first internship.</p>
        </div>
      )}
      <PageHeader title="Company page" subtitle="Students see this on your postings and company page." />
      <CompanyForm company={q.data!} />
    </div>
  );
}

function CompanyForm({ company: c }: { company: Company }) {
  const qc = useQueryClient();
  const { reload } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const form = useForm<CompanyInput>({
    resolver: zodResolver(CompanySchema) as never,
    defaultValues: {
      name: c.name,
      tagline: c.tagline ?? '',
      about: c.about ?? '',
      website: c.website ?? '',
      logoUrl: c.logoUrl ?? '',
      city: c.city ?? '',
      industry: c.industry ?? '',
      size: (c.size as CompanyInput['size']) ?? '1-10',
    },
  });
  const { errors, isSubmitting, isDirty } = form.formState;
  const logo = form.watch('logoUrl');
  const name = form.watch('name');

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const { company } = await api<{ company: Company }>('/companies/mine', { method: 'PUT', body: values });
      qc.setQueryData(['my-company'], company);
      qc.invalidateQueries({ queryKey: ['company', company.slug] });
      await reload();
      form.reset(values);
      toast.success('Company page saved');
      if (params.get('welcome')) navigate('/employer/internships/new');
    } catch (err) {
      applyServerErrors(err, form.setError);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar name={name || c.name} src={logo || undefined} size="xl" square />
          <div className="flex-1">
            <Input label="Logo URL" optional placeholder="https://…/logo.png" hint="A square image works best." error={errors.logoUrl?.message} {...form.register('logoUrl')} />
          </div>
        </div>
        <Input label="Company name" error={errors.name?.message} {...form.register('name')} />
        <Input label="Tagline" placeholder="One line on what you do" error={errors.tagline?.message} {...form.register('tagline')} />
        <Textarea label="About" rows={6} placeholder="What you build, who you serve, and what interns will learn." error={errors.about?.message} {...form.register('about')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Industry" placeholder="Fintech, Healthtech…" error={errors.industry?.message} {...form.register('industry')} />
          <Select label="City" error={errors.city?.message} {...form.register('city')}>
            <option value="">Select a city</option>
            {CITIES.map((ct) => <option key={ct}>{ct}</option>)}
          </Select>
          <Select label="Company size" {...form.register('size')}>
            {COMPANY_SIZES.map((sz) => <option key={sz} value={sz}>{sz} people</option>)}
          </Select>
          <Input label="Website" optional placeholder="https://" error={errors.website?.message} {...form.register('website')} />
        </div>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={isSubmitting} disabled={!isDirty && !params.get('welcome')}>
          {params.get('welcome') ? 'Save and post an internship' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
