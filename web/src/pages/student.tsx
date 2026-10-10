import { useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Bookmark, Briefcase, Check, FileText, Link2, MessageSquare, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { APPLICATION_STATUSES, StudentProfileSchema, type ApplicationStatus, type StudentProfileInput } from '@shared/schemas';
import { InternshipCard } from '../components/internships';
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  Checkbox,
  CompanyName,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  PageSpinner,
  TagInput,
  Textarea,
  cx,
} from '../components/ui';
import { ApiError, api, openProtectedFile } from '../lib/api';
import { STATUS_META, formatBytes, formatDate, formatLocation, formatPay, timeAgo } from '../lib/format';
import { applyServerErrors, toastError } from '../lib/forms';
import type { Application, Internship, StudentProfile } from '../lib/types';
import { NotFound } from './Public';

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const m = STATUS_META[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

const ACTIVE: ApplicationStatus[] = ['applied', 'reviewing', 'interview', 'offered'];

export function StudentDashboard() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'saved' ? 'saved' : params.get('tab') === 'closed' ? 'closed' : 'active';

  const apps = useQuery({ queryKey: ['my-applications'], queryFn: () => api<{ items: Application[] }>('/applications/mine') });
  const saved = useQuery({ queryKey: ['saved'], queryFn: () => api<{ items: Internship[] }>('/internships/saved') });
  const profile = useQuery({ queryKey: ['profile'], queryFn: () => api<{ profile: StudentProfile }>('/profile/me') });

  const items = apps.data?.items ?? [];
  const active = items.filter((a) => ACTIVE.includes(a.status));
  const closed = items.filter((a) => !ACTIVE.includes(a.status));
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, items.filter((a) => a.status === s).length]));

  const p = profile.data?.profile;
  const checklist = p
    ? [
        { done: !!p.resume, label: 'Upload your resume' },
        { done: p.skills.length >= 3, label: 'Add at least 3 skills' },
        { done: !!p.university, label: 'Add your university' },
        { done: !!p.headline, label: 'Write a headline' },
      ]
    : [];
  const incomplete = checklist.filter((c) => !c.done);

  const tabs = [
    ['active', `Active (${active.length})`],
    ['closed', `Closed (${closed.length})`],
    ['saved', `Saved (${saved.data?.items.length ?? 0})`],
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader title="My applications" subtitle="Track where each application stands." actions={<ButtonLink to="/internships">Find internships</ButtonLink>} />

      {incomplete.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50/60 p-5">
          <p className="font-bold">Finish your profile to start applying</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {checklist.map((c) => (
              <li key={c.label} className={cx('flex items-center gap-2 text-sm', c.done ? 'text-slate-400 line-through' : 'text-slate-800')}>
                <span className={cx('flex size-5 items-center justify-center rounded-full border', c.done ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white')}>
                  {c.done && <Check className="size-3" />}
                </span>
                {c.label}
              </li>
            ))}
          </ul>
          <ButtonLink to="/profile" size="sm" className="mt-4">Complete profile</ButtonLink>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['applied', 'reviewing', 'interview', 'offered'] as const).map((s) => (
          <Card key={s} className="p-4">
            <p className="text-2xl font-extrabold">{(counts[s] ?? 0) + (s === 'offered' ? (counts.hired ?? 0) : 0)}</p>
            <p className="text-sm text-slate-500">{s === 'offered' ? 'Offers' : STATUS_META[s].label}</p>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex gap-1 border-b border-slate-200" role="tablist">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setParams(key === 'active' ? {} : { tab: key })}
            className={cx('-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold', tab === key ? 'border-brand-700 text-brand-800' : 'border-transparent text-slate-500 hover:text-ink')}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'saved' ? (
        saved.isLoading ? (
          <PageSpinner />
        ) : saved.data?.items.length ? (
          <div className="grid gap-3 sm:grid-cols-2">{saved.data.items.map((i) => <InternshipCard key={i._id} internship={i} />)}</div>
        ) : (
          <Card><EmptyState icon={<Bookmark className="size-6" />} title="Nothing saved yet" body="Save internships while you browse and come back to them here." /></Card>
        )
      ) : apps.isLoading ? (
        <PageSpinner />
      ) : apps.isError ? (
        <ErrorState error={apps.error} retry={() => apps.refetch()} />
      ) : (tab === 'active' ? active : closed).length === 0 ? (
        <Card>
          <EmptyState
            icon={<Briefcase className="size-6" />}
            title={tab === 'active' ? 'No active applications' : 'No closed applications'}
            body={tab === 'active' ? 'When you apply to an internship, it will show up here.' : 'Applications that end up hired, not selected or withdrawn appear here.'}
            action={tab === 'active' && <ButtonLink to="/internships">Browse internships</ButtonLink>}
          />
        </Card>
      ) : (
        <Card className="divide-y divide-slate-100">
          {(tab === 'active' ? active : closed).map((a) => (
            <Link key={a._id} to={`/applications/${a._id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50">
              <Avatar name={a.internship?.company?.name ?? '?'} src={a.internship?.company?.logoUrl} square />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{a.internship?.title ?? 'Internship removed'}</p>
                <p className="truncate text-sm text-slate-500">
                  {a.internship?.company?.name} · Applied {formatDate(a.createdAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={a.status} />
                <span className="hidden text-xs text-slate-400 sm:block">Updated {timeAgo(a.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}

export function ApplicationPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['application', id], queryFn: () => api<{ application: Application }>(`/applications/${id}`).then((r) => r.application) });
  const withdraw = useMutation({
    mutationFn: () => api(`/applications/${id}/withdraw`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Application withdrawn');
      qc.invalidateQueries({ queryKey: ['application', id] });
      qc.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onError: toastError,
  });

  if (q.isLoading) return <PageSpinner />;
  if (q.error instanceof ApiError && [403, 404].includes(q.error.status)) return <NotFound what="application" />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const a = q.data!;
  const i = a.internship;
  const canWithdraw = ACTIVE.includes(a.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <Link to="/dashboard" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-ink">
        <ArrowLeft className="size-4" /> My applications
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar name={i?.company?.name ?? '?'} src={i?.company?.logoUrl} size="lg" square />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-600">{i?.company && <CompanyName name={i.company.name} verified={i.company.verified} />}</p>
            <h1 className="text-2xl font-extrabold tracking-tight">{i?.title}</h1>
            {i?.mode && <p className="mt-1 text-sm text-slate-500">{formatLocation(i as Internship)} · {formatPay(i as Internship)}</p>}
          </div>
          <StatusBadge status={a.status} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink to={`/internships/${a.internshipId}`} variant="secondary" size="sm">View posting</ButtonLink>
          {a.conversationId && (
            <ButtonLink to={`/messages/${a.conversationId}`} size="sm"><MessageSquare className="size-4" /> Messages</ButtonLink>
          )}
          {canWithdraw && (
            <Button
              variant="danger"
              size="sm"
              loading={withdraw.isPending}
              onClick={() => confirm('Withdraw this application? You will not be able to apply to this internship again.') && withdraw.mutate()}
            >
              Withdraw
            </Button>
          )}
        </div>
      </Card>

      <Card className="mt-5 p-5 sm:p-6">
        <h2 className="font-bold">Progress</h2>
        <ol className="mt-4 space-y-0">
          {[...a.history].reverse().map((h, n) => (
            <li key={n} className="relative flex gap-4 pb-5 last:pb-0">
              {n < a.history.length - 1 && <span className="absolute left-[9px] top-6 h-full w-px bg-slate-200" aria-hidden />}
              <span className={cx('relative mt-0.5 size-5 shrink-0 rounded-full border-4', n === 0 ? 'border-brand-200 bg-brand-600' : 'border-slate-100 bg-slate-300')} />
              <div>
                <p className="font-semibold">{STATUS_META[h.status].label}</p>
                <p className="text-sm text-slate-500">{formatDate(h.at)}</p>
                {h.note && <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{h.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="mt-5 p-5 sm:p-6">
        <h2 className="font-bold">What you sent</h2>
        {a.resume && (
          <button onClick={() => openProtectedFile(`/profile/resumes/${a.resume!.fileId}`).catch(toastError)} className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline">
            <FileText className="size-4" /> {a.resume.fileName}
          </button>
        )}
        {a.answers.map((ans) => (
          <div key={ans.questionId} className="mt-4">
            <p className="text-sm font-semibold text-slate-800">{ans.prompt}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{ans.answer || '—'}</p>
          </div>
        ))}
        {a.coverLetter && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-800">Cover note</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{a.coverLetter}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export function ProfilePage() {
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const q = useQuery({ queryKey: ['profile'], queryFn: () => api<{ profile: StudentProfile }>('/profile/me').then((r) => r.profile) });

  if (q.isLoading) return <PageSpinner />;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const p = q.data!;

  const onFile = async (file?: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf') return toast.error('Please upload a PDF');
    if (file.size > 2 * 1024 * 1024) return toast.error('Resume must be 2 MB or smaller');
    const body = new FormData();
    body.append('resume', file);
    setUploading(true);
    try {
      const { profile } = await api<{ profile: StudentProfile }>('/profile/me/resume', { method: 'POST', body });
      qc.setQueryData(['profile'], profile);
      toast.success('Resume uploaded');
    } catch (err) {
      toastError(err);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const removeResume = async () => {
    if (!confirm('Remove your resume? You will need one to apply.')) return;
    try {
      const { profile } = await api<{ profile: StudentProfile }>('/profile/me/resume', { method: 'DELETE' });
      qc.setQueryData(['profile'], profile);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {params.get('welcome') && (
        <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
          <p className="font-bold">Welcome to WorkNest!</p>
          <p className="mt-1">Add your resume and a few details below. Employers see this profile when you apply.</p>
        </div>
      )}
      <PageHeader title="My profile" subtitle="This is what employers see when you apply." />

      <Card className="mb-6 p-5 sm:p-6">
        <h2 className="font-bold">Resume</h2>
        <p className="mt-1 text-sm text-slate-500">PDF, up to 2 MB. It's attached to every application you send.</p>
        <input ref={fileInput} type="file" accept="application/pdf" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        {p.resume ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 p-3">
            <FileText className="size-8 text-red-600" />
            <div className="min-w-0 flex-1">
              <button onClick={() => openProtectedFile(`/profile/resumes/${p.resume!.fileId}`).catch(toastError)} className="truncate text-sm font-semibold hover:underline">
                {p.resume.fileName}
              </button>
              <p className="text-xs text-slate-500">{formatBytes(p.resume.size)} · Uploaded {timeAgo(p.resume.uploadedAt)}</p>
            </div>
            <Button variant="secondary" size="sm" loading={uploading} onClick={() => fileInput.current?.click()}>Replace</Button>
            <Button variant="ghost" size="sm" onClick={removeResume} aria-label="Remove resume"><Trash2 className="size-4" /></Button>
          </div>
        ) : (
          <button
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files[0]);
            }}
            className="mt-4 flex w-full flex-col items-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-8 text-center hover:border-brand-600 hover:bg-brand-50/40"
            disabled={uploading}
          >
            <Upload className="size-6 text-slate-400" />
            <span className="mt-2 text-sm font-semibold">{uploading ? 'Uploading…' : 'Upload your resume'}</span>
            <span className="text-xs text-slate-500">Click or drag a PDF here</span>
          </button>
        )}
      </Card>

      <ProfileForm key={p._id} profile={p} />
    </div>
  );
}

function ProfileForm({ profile: p }: { profile: StudentProfile }) {
  const qc = useQueryClient();
  const form = useForm<StudentProfileInput>({
    resolver: zodResolver(StudentProfileSchema) as never,
    defaultValues: {
      name: p.name,
      headline: p.headline,
      university: p.university,
      degree: p.degree,
      graduationYear: p.graduationYear,
      city: p.city,
      bio: p.bio,
      skills: p.skills,
      gpa: p.gpa,
      hideGpa: p.hideGpa,
      links: { github: p.links?.github ?? '', linkedin: p.links?.linkedin ?? '', portfolio: p.links?.portfolio ?? '' },
    },
  });
  const { errors, isSubmitting, isDirty } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const { profile } = await api<{ profile: StudentProfile }>('/profile/me', { method: 'PUT', body: values });
      qc.setQueryData(['profile'], profile);
      form.reset(form.getValues());
      toast.success('Profile saved');
    } catch (err) {
      applyServerErrors(err, form.setError);
    }
  });

  const num = { setValueAs: (v: string) => (v === '' || v === null ? undefined : Number(v)) };

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="font-bold">About you</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" error={errors.name?.message} {...form.register('name')} />
          <Input label="City" placeholder="Lahore" error={errors.city?.message} {...form.register('city')} />
        </div>
        <Input label="Headline" placeholder="e.g. CS student interested in backend and data" error={errors.headline?.message} {...form.register('headline')} />
        <Textarea label="Bio" optional rows={4} placeholder="Projects you've built, what you're learning, what you want to work on." error={errors.bio?.message} {...form.register('bio')} />
        <Controller
          control={form.control}
          name="skills"
          render={({ field, fieldState }) => (
            <TagInput label="Skills" value={field.value ?? []} onChange={field.onChange} placeholder="React, Python, Figma…" error={fieldState.error?.message} />
          )}
        />
      </Card>

      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="font-bold">Education</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="University" error={errors.university?.message} {...form.register('university')} />
          <Input label="Degree" placeholder="BS Computer Science" error={errors.degree?.message} {...form.register('degree')} />
          <Input label="Graduation year" type="number" inputMode="numeric" optional error={errors.graduationYear?.message} {...form.register('graduationYear', num)} />
          <Input label="GPA (out of 4.0)" type="number" step="0.01" inputMode="decimal" optional error={errors.gpa?.message} {...form.register('gpa', num)} />
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <Checkbox
            label="Hide my GPA from employers"
            description="Employers will judge you on your skills, projects and resume instead."
            {...form.register('hideGpa')}
          />
          <p className="mt-2 flex items-center gap-1.5 pl-7 text-xs text-slate-500"><ShieldCheck className="size-3.5" /> On by default.</p>
        </div>
      </Card>

      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-bold"><Link2 className="size-4" /> Links</h2>
        <Input label="GitHub" optional placeholder="https://github.com/you" error={errors.links?.github?.message} {...form.register('links.github')} />
        <Input label="LinkedIn" optional placeholder="https://linkedin.com/in/you" error={errors.links?.linkedin?.message} {...form.register('links.linkedin')} />
        <Input label="Portfolio" optional placeholder="https://you.dev" error={errors.links?.portfolio?.message} {...form.register('links.portfolio')} />
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" size="lg" loading={isSubmitting} disabled={!isDirty} className="shadow-lg">Save profile</Button>
      </div>
    </form>
  );
}
