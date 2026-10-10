import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Inbox, Send } from 'lucide-react';
import { Avatar, Button, Card, EmptyState, ErrorState, Spinner, cx } from '../components/ui';
import { ApiError, api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { timeAgo } from '../lib/format';
import { toastError } from '../lib/forms';
import type { Conversation, Message } from '../lib/types';

function counterpart(c: Conversation, role: string) {
  return role === 'student'
    ? { name: c.company?.name ?? 'Company', logo: c.company?.logoUrl, square: true }
    : { name: c.student?.name ?? 'Student', logo: undefined, square: false };
}

export default function MessagesPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const list = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api<{ items: Conversation[] }>('/conversations'),
    refetchInterval: 15_000,
  });

  const items = list.data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-0 py-0 sm:px-6 sm:py-8">
      <Card className="grid h-[calc(100vh-4rem)] overflow-hidden rounded-none border-x-0 sm:h-[calc(100vh-8rem)] sm:rounded-xl sm:border-x md:grid-cols-[20rem_1fr]">
        <aside className={cx('flex min-h-0 flex-col border-r border-slate-200', id && 'hidden md:flex')}>
          <h1 className="border-b border-slate-200 px-4 py-4 text-lg font-extrabold">Messages</h1>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {list.isLoading && <div className="flex justify-center py-10"><Spinner /></div>}
            {list.isError && <ErrorState error={list.error} retry={() => list.refetch()} />}
            {list.isSuccess && items.length === 0 && (
              <EmptyState
                icon={<Inbox className="size-6" />}
                title="No conversations yet"
                body={user?.role === 'employer' ? 'Message an applicant from the applicants page.' : 'When a hiring team messages you about an application, it shows up here.'}
              />
            )}
            {items.map((c) => {
              const other = counterpart(c, user!.role);
              return (
                <Link key={c._id} to={`/messages/${c._id}`} className={cx('flex gap-3 border-b border-slate-100 px-4 py-3 hover:bg-slate-50', c._id === id && 'bg-brand-50/60')}>
                  <Avatar name={other.name} src={other.logo} size="sm" square={other.square} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={cx('truncate text-sm', c.unread ? 'font-bold' : 'font-semibold')}>{other.name}</p>
                      <span className="shrink-0 text-xs text-slate-400">{timeAgo(c.lastMessageAt)}</span>
                    </div>
                    <p className="truncate text-xs text-slate-500">{c.internship?.title}</p>
                    <p className={cx('truncate text-sm', c.unread ? 'font-semibold text-ink' : 'text-slate-500')}>{c.lastMessagePreview || 'No messages yet'}</p>
                  </div>
                  {c.unread > 0 && <span className="mt-1 size-2.5 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />}
                </Link>
              );
            })}
          </div>
        </aside>
        <section className={cx('min-h-0 flex-col', id ? 'flex' : 'hidden md:flex')}>
          {id ? <Thread key={id} id={id} /> : <EmptyState title="Select a conversation" />}
        </section>
      </Card>
    </div>
  );
}

function Thread({ id }: { id: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const bottom = useRef<HTMLDivElement>(null);
  const lastAt = messages.at(-1)?.createdAt;

  // Poll for only new messages after the last one we have.
  const q = useQuery({
    queryKey: ['thread', id, lastAt ?? 'initial'],
    queryFn: () => api<{ conversation: Conversation; side: 'student' | 'company'; messages: Message[] }>(`/conversations/${id}/messages`, { query: { after: lastAt } }),
    refetchInterval: 5_000,
  });

  const conversation = q.data?.conversation;
  const side = q.data?.side;

  useEffect(() => {
    const fresh = q.data?.messages ?? [];
    if (!fresh.length) return;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m._id));
      return [...prev, ...fresh.filter((m) => !seen.has(m._id))];
    });
    qc.invalidateQueries({ queryKey: ['conversations'] });
    qc.invalidateQueries({ queryKey: ['unread-messages'] });
  }, [q.data, qc]);

  useEffect(() => bottom.current?.scrollIntoView({ block: 'end' }), [messages.length]);

  const send = useMutation({
    mutationFn: (body: string) => api<{ message: Message }>(`/conversations/${id}/messages`, { method: 'POST', body: { body } }),
    onSuccess: ({ message }) => {
      setMessages((prev) => [...prev, message]);
      setDraft('');
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: toastError,
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (draft.trim()) send.mutate(draft.trim());
  };

  if (q.error instanceof ApiError && [403, 404].includes(q.error.status)) return <EmptyState title="Conversation not found" />;
  if (!conversation) return <div className="flex flex-1 items-center justify-center"><Spinner /></div>;
  const other = counterpart(conversation, user!.role);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
        <Link to="/messages" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 md:hidden" aria-label="Back"><ArrowLeft className="size-5" /></Link>
        <Avatar name={other.name} src={other.logo} size="sm" square={other.square} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{other.name}</p>
          <Link
            to={user!.role === 'student' ? `/applications/${conversation.applicationId}` : `/employer/internships/${conversation.internship?._id}/applicants?app=${conversation.applicationId}`}
            className="truncate text-xs text-brand-700 hover:underline"
          >
            Re: {conversation.internship?.title}
          </Link>
        </div>
      </header>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-slate-500">Say hello to start the conversation.</p>}
        {messages.map((m) => {
          const mine = m.side === side;
          return (
            <div key={m._id} className={cx('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={cx('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm', mine ? 'rounded-br-md bg-brand-700 text-white' : 'rounded-bl-md bg-white text-ink')}>
                <p className="whitespace-pre-line break-words">{m.body}</p>
                <p className={cx('mt-1 text-[11px]', mine ? 'text-brand-100' : 'text-slate-400')}>{timeAgo(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-slate-200 p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) onSubmit(e);
          }}
          rows={1}
          maxLength={4000}
          placeholder="Write a message…"
          aria-label="Message"
          className="max-h-32 min-h-10 flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
        />
        <Button type="submit" loading={send.isPending} disabled={!draft.trim()} aria-label="Send"><Send className="size-4" /></Button>
      </form>
    </>
  );
}
