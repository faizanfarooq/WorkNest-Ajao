import { useEffect, useRef, useState, type DragEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, FileText, Link2, MessageSquare, Users, X } from 'lucide-react';
import type { ApplicationStatus } from '@shared/schemas';
import { Avatar, Button, ButtonLink, Card, EmptyState, PageSpinner, cx } from '../components/ui';
import { api, openProtectedFile } from '../lib/api';
import { STATUS_META, formatDate, timeAgo } from '../lib/format';
import { toastError } from '../lib/forms';
import type { Application, Internship } from '../lib/types';

type ApplicantsResponse = { internship: Pick<Internship, '_id' | 'title' | 'status'>; items: Application[] };

/** An application plus the posting it belongs to. */
export type CompanyApplication = Application & { posting: Internship };

/**
 * Every application across the company's postings. There is no company-wide endpoint, so this
 * loads each posting's applicants (companies have a handful of postings) and merges them.
 */
export function useCompanyApplications() {
  const postings = useQuery({ queryKey: ['my-internships'], queryFn: () => api<{ items: Internship[] }>('/internships/mine') });
  const withApplicants = (postings.data?.items ?? []).filter((i) => i.applicationCount > 0);
  const lists = useQueries({
    queries: withApplicants.map((i) => ({
      queryKey: ['applicants', i._id],
      queryFn: () => api<ApplicantsResponse>(`/applications/internship/${i._id}`),
    })),
  });
  const applications: CompanyApplication[] = lists
    .flatMap((l, n) => (l.data?.items ?? []).map((a) => ({ ...a, posting: withApplicants[n] })))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    postings: postings.data?.items ?? [],
    applications,
    isLoading: postings.isLoading || lists.some((l) => l.isLoading),
    error: postings.error ?? lists.find((l) => l.error)?.error,
  };
}

/** Share of the posting's listed skills the student has, or undefined when the posting lists none. */
export function matchScore(a: CompanyApplication) {
  const wanted = a.posting.skills.map((s) => s.toLowerCase());
  if (!wanted.length) return undefined;
  const has = new Set((a.student?.skills ?? []).map((s) => s.toLowerCase()));
  return Math.round((wanted.filter((s) => has.has(s)).length / wanted.length) * 100);
}

const STAGES: { id: ApplicationStatus; label: string; dot: string }[] = [
  { id: 'applied', label: 'Applied', dot: 'bg-slate-400' },
  { id: 'reviewing', label: 'In review', dot: 'bg-indigo-500' },
  { id: 'interview', label: 'Interview', dot: 'bg-amber-500' },
  { id: 'offered', label: 'Offer', dot: 'bg-brand-600' },
  { id: 'hired', label: 'Hired', dot: 'bg-emerald-800' },
];
const stageLabel = (s: ApplicationStatus) => STAGES.find((st) => st.id === s)?.label ?? STATUS_META[s].label;

/** Moves an application to a stage, updating the board at once and notifying the student. */
function useMoveApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ app, status, note }: { app: CompanyApplication; status: ApplicationStatus; note?: string }) =>
      api(`/applications/${app._id}/status`, { method: 'PATCH', body: { status, note } }),
    onMutate: ({ app, status }) =>
      qc.setQueryData<ApplicantsResponse>(['applicants', app.internshipId], (d) =>
        d && { ...d, items: d.items.map((a) => (a._id === app._id ? { ...a, status } : a)) },
      ),
    onError: toastError,
    onSuccess: (_d, { app, status }) =>
      toast.success(`${app.student?.name.split(' ')[0] ?? 'Applicant'} moved to ${stageLabel(status)}${status === 'offered' || status === 'hired' ? ' 🎉' : ''}`),
    onSettled: (_d, _e, { app }) => {
      qc.invalidateQueries({ queryKey: ['applicants', app.internshipId] });
      qc.invalidateQueries({ queryKey: ['my-internships'] });
    },
  });
}

function exportCsv(apps: CompanyApplication[]) {
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['Name', 'Email', 'University', 'Degree', 'City', 'Skills', 'Internship', 'Stage', 'Applied'],
    ...apps.map((a) => [
      a.student?.name,
      a.student?.email,
      a.student?.university,
      a.student?.degree,
      a.student?.city,
      a.student?.skills.join(', '),
      a.posting.title,
      STATUS_META[a.status].label,
      formatDate(a.createdAt),
    ]),
  ];
  const url = URL.createObjectURL(new Blob([rows.map((r) => r.map(cell).join(',')).join('\n')], { type: 'text/csv' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: 'worknest-applicants.csv' });
  link.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${apps.length} applicant${apps.length === 1 ? '' : 's'}`);
}

// ---------- Board ----------

export function ApplicantsBoardPage() {
  const [params, setParams] = useSearchParams();
  const { postings, applications, isLoading } = useCompanyApplications();
  const move = useMoveApplication();
  const [role, setRole] = useState('all');
  const [over, setOver] = useState<ApplicationStatus | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  if (isLoading) return <PageSpinner />;

  const open = (id: string | null) => {
    const next = new URLSearchParams(params);
    id ? next.set('app', id) : next.delete('app');
    setParams(next, { replace: true });
  };

  const onBoard = applications.filter((a) => STAGES.some((s) => s.id === a.status));
  const visible = onBoard.filter((a) => role === 'all' || a.internshipId === role);
  const hidden = applications.length - onBoard.length;
  const roles = postings.filter((p) => applications.some((a) => a.internshipId === p._id));

  const drop = (e: DragEvent, stage: ApplicationStatus) => {
    e.preventDefault();
    setOver(null);
    const app = applications.find((a) => a._id === e.dataTransfer.getData('text/plain'));
    if (!app || app.status === stage) return;
    if (stage === 'applied') return void toast.info('Applications can’t be moved back to Applied');
    move.mutate({ app, status: stage });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 motion-safe:animate-fade-up sm:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Applicants</h1>
          <p className="mt-1 text-slate-500">Drag candidates between stages. Click a card to see their profile.</p>
        </div>
        <Button variant="secondary" onClick={() => exportCsv(visible)} disabled={!visible.length}>
          <Download className="size-4" /> Export CSV
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="size-6" />}
            title="No applicants yet"
            body="When students apply to your internships, they show up here."
            action={<ButtonLink to="/employer/internships/new">Post an internship</ButtonLink>}
          />
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {[{ _id: 'all', title: 'All roles' }, ...roles].map((p) => (
              <button
                key={p._id}
                onClick={() => setRole(p._id)}
                className={cx(
                  'rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors',
                  role === p._id ? 'border-ink bg-ink text-white' : 'border-slate-200 bg-white hover:border-slate-300',
                )}
              >
                {p.title}
              </button>
            ))}
          </div>

          <div className="grid auto-cols-[minmax(210px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2">
            {STAGES.map((st) => {
              const list = visible.filter((a) => a.status === st.id);
              return (
                <section
                  key={st.id}
                  aria-label={st.label}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (st.id !== 'applied') setOver(st.id);
                  }}
                  onDragLeave={() => setOver(null)}
                  onDrop={(e) => drop(e, st.id)}
                  className={cx(
                    'min-h-[420px] rounded-2xl p-3 outline-2 -outline-offset-4 transition-colors',
                    over === st.id ? 'bg-brand-50 outline-dashed outline-brand-600' : 'bg-slate-100 outline-transparent',
                  )}
                >
                  <h2 className="flex items-center gap-2 px-1.5 pb-3 pt-1 font-bold">
                    <span className={cx('size-2.5 rounded-full', st.dot)} />
                    {st.label}
                    <span className="ml-auto rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-500">{list.length}</span>
                  </h2>
                  {list.map((a) => (
                    <ApplicantCard
                      key={a._id}
                      app={a}
                      dragging={dragging === a._id}
                      onOpen={() => open(a._id)}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', a._id);
                        setDragging(a._id);
                      }}
                      onDragEnd={() => setDragging(null)}
                    />
                  ))}
                </section>
              );
            })}
          </div>
          {hidden > 0 && (
            <p className="mt-3 text-sm text-slate-500">
              {hidden} not selected or withdrawn application{hidden === 1 ? ' is' : 's are'} hidden. Find them on each posting’s applicants page.
            </p>
          )}
        </>
      )}

      <ApplicantDrawer app={applications.find((a) => a._id === params.get('app')) ?? null} onClose={() => open(null)} />
    </div>
  );
}

function ApplicantCard({
  app: a,
  dragging,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  app: CompanyApplication;
  dragging: boolean;
  onOpen: () => void;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
}) {
  const match = matchScore(a);
  return (
    // A div rather than a button: Firefox won't drag a <button>.
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
      className={cx(
        'mb-2.5 block w-full cursor-grab select-none rounded-xl border border-slate-200 bg-white p-3 text-left transition-[transform,box-shadow,opacity] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgb(15_23_42/0.35)]',
        dragging && 'rotate-2 opacity-45',
      )}
    >
      <div className="flex items-center gap-2.5">
        <Avatar name={a.student?.name ?? '?'} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-bold">{a.student?.name}</p>
          <p className="truncate text-xs text-slate-500">{[a.student?.university, a.student?.degree].filter(Boolean).join(' · ') || a.student?.email}</p>
        </div>
        {match !== undefined && (
          <span className={cx('ml-auto shrink-0 rounded-lg px-2 py-1 text-[11px] font-extrabold', match >= 70 ? 'bg-brand-100 text-brand-800' : 'bg-amber-100 text-amber-700')}>
            {match}%
          </span>
        )}
      </div>
      {!!a.student?.skills.length && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {a.student.skills.slice(0, 3).map((s) => (
            <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-700">{s}</span>
          ))}
        </div>
      )}
      <div className="mt-2.5 flex justify-between gap-2 text-[11px] text-slate-500">
        <span className="truncate">{a.posting.title}</span>
        <span className="shrink-0">{timeAgo(a.createdAt)}</span>
      </div>
    </div>
  );
}

// ---------- Drawer ----------

const RING = 2 * Math.PI * 26;

function ApplicantDrawer({ app, onClose }: { app: CompanyApplication | null; onClose: () => void }) {
  const navigate = useNavigate();
  const move = useMoveApplication();
  // Keep showing the last applicant while the drawer slides out.
  const [shown, setShown] = useState(app);
  const [ring, setRing] = useState(0);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (app) setShown(app);
  }, [app]);

  const match = shown ? matchScore(shown) : undefined;
  useEffect(() => {
    if (!app) return setRing(0);
    close.current?.focus();
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setRing(match ?? 0)));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('keydown', onKey);
    };
  }, [app, match, onClose]);

  const message = useMutation({
    mutationFn: (applicationId: string) => api<{ conversation: { _id: string } }>('/conversations', { method: 'POST', body: { applicationId } }),
    onSuccess: ({ conversation }) => navigate(`/messages/${conversation._id}`),
    onError: toastError,
  });

  const s = shown?.student;
  const open = !!app;
  const has = new Set((s?.skills ?? []).map((k) => k.toLowerCase()));
  const links = Object.entries(s?.links ?? {}).filter(([, v]) => v);
  const nextStage = ({ applied: 'reviewing', reviewing: 'interview', interview: 'offered', offered: 'hired' } as Partial<Record<ApplicationStatus, ApplicationStatus>>)[shown?.status ?? 'hired'];

  return (
    <>
      <div className={cx('fixed inset-0 z-40 bg-ink/35 transition-opacity duration-300', open ? 'opacity-100' : 'pointer-events-none opacity-0')} onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={s ? `${s.name}'s application` : 'Applicant'}
        aria-hidden={!open}
        className={cx(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-[-30px_0_60px_-30px_rgb(0_0_0/0.3)] transition-[transform,visibility] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]',
          open ? 'translate-x-0' : 'invisible translate-x-full',
        )}
      >
        {shown && s && (
          <>
            <div className="flex items-center gap-3.5 border-b border-slate-200 p-5">
              <Avatar name={s.name} size="lg" />
              <div className="min-w-0">
                <h2 className="truncate text-lg font-extrabold">{s.name}</h2>
                <p className="truncate text-sm text-slate-500">{[s.degree, s.university].filter(Boolean).join(' · ') || s.email}</p>
              </div>
              <button ref={close} onClick={onClose} className="ml-auto self-start rounded-lg bg-slate-100 p-2 hover:bg-slate-200" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {match !== undefined && (
                <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-3.5">
                  <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0" aria-hidden>
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      stroke="#079669"
                      strokeWidth="7"
                      strokeLinecap="round"
                      transform="rotate(-90 32 32)"
                      strokeDasharray={RING}
                      strokeDashoffset={RING * (1 - ring / 100)}
                      className="transition-[stroke-dashoffset] duration-1000 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none"
                    />
                    <text x="32" y="37" textAnchor="middle" fontSize="15" fontWeight="800" fill="#0f172a">{match}%</text>
                  </svg>
                  <div>
                    <p className="text-sm font-bold">{match >= 70 ? 'Strong match' : match >= 40 ? 'Partial match' : 'Low match'} for {shown.posting.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Has {shown.posting.skills.filter((k) => has.has(k.toLowerCase())).length} of the {shown.posting.skills.length} skills you listed.
                    </p>
                  </div>
                </div>
              )}

              <section>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">Details</h3>
                <dl className="grid grid-cols-2 gap-2.5">
                  {[
                    ['Stage', STATUS_META[shown.status].label],
                    ['Applied for', shown.posting.title],
                    ['City', s.city || '—'],
                    ['Applied', formatDate(shown.createdAt)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-slate-200 p-3">
                      <dt className="text-[11px] text-slate-500">{k}</dt>
                      <dd className="truncate text-sm font-bold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {shown.status !== 'withdrawn' && (
                <section>
                  <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">Move to</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(['reviewing', 'interview', 'offered', 'hired', 'rejected'] as const).map((st) => (
                      <button
                        key={st}
                        disabled={st === shown.status || move.isPending}
                        onClick={() => move.mutate({ app: shown, status: st })}
                        className={cx(
                          'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-default',
                          st === shown.status ? 'border-ink bg-ink text-white' : st === 'rejected' ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-slate-200 hover:bg-slate-50',
                        )}
                      >
                        {STATUS_META[st].label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">The student is notified when you change the stage.</p>
                </section>
              )}

              {!!s.skills.length && (
                <section>
                  <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {s.skills.map((k) => (
                      <span key={k} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{k}</span>
                    ))}
                  </div>
                </section>
              )}

              {s.bio && (
                <section>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">About</h3>
                  <p className="whitespace-pre-line text-sm text-slate-700">{s.bio}</p>
                </section>
              )}

              {shown.answers.map((ans) => (
                <section key={ans.questionId}>
                  <h3 className="text-sm font-semibold">{ans.prompt}</h3>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{ans.answer || '—'}</p>
                </section>
              ))}
              {shown.coverLetter && (
                <section>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Cover note</h3>
                  <p className="whitespace-pre-line text-sm text-slate-700">{shown.coverLetter}</p>
                </section>
              )}

              {(shown.resume || links.length > 0) && (
                <section className="flex flex-wrap gap-2">
                  {shown.resume && (
                    <Button variant="secondary" size="sm" onClick={() => openProtectedFile(`/profile/resumes/${shown.resume!.fileId}`).catch(toastError)}>
                      <FileText className="size-4" /> Resume
                    </Button>
                  )}
                  {links.map(([k, v]) => (
                    <a key={k} href={v} target="_blank" rel="noreferrer noopener" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-semibold capitalize hover:bg-slate-50">
                      <Link2 className="size-4" /> {k}
                    </a>
                  ))}
                </section>
              )}

              <Link to={`/employer/internships/${shown.internshipId}/applicants?app=${shown._id}`} className="block text-sm font-semibold text-brand-700 hover:underline">
                Full application and history →
              </Link>
            </div>

            <div className="flex gap-2.5 border-t border-slate-200 p-4">
              <Button variant="secondary" className="flex-1" loading={message.isPending} onClick={() => message.mutate(shown._id)}>
                <MessageSquare className="size-4" /> Message
              </Button>
              {nextStage && shown.status !== 'withdrawn' && (
                <Button className="flex-1" loading={move.isPending} onClick={() => move.mutate({ app: shown, status: nextStage })}>
                  Move to {stageLabel(nextStage)}
                </Button>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
