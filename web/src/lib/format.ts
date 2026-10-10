import type { ApplicationStatus, WorkMode } from '@shared/schemas';
import type { Internship } from './types';

const number = new Intl.NumberFormat('en-US');

export function formatPay(i: Pick<Internship, 'paid' | 'payAmount' | 'payCurrency' | 'payPeriod'>) {
  if (!i.paid) return 'Unpaid';
  const amount = i.payCurrency === 'USD' ? `$${number.format(i.payAmount)}` : `Rs ${number.format(i.payAmount)}`;
  return i.payPeriod === 'total' ? `${amount} total` : `${amount}/${i.payPeriod === 'week' ? 'wk' : 'mo'}`;
}

export const MODE_LABEL: Record<WorkMode, string> = { onsite: 'On-site', hybrid: 'Hybrid', remote: 'Remote' };

export function formatLocation(i: Pick<Internship, 'mode' | 'city'>) {
  if (i.mode === 'remote') return i.city ? `Remote · ${i.city}` : 'Remote';
  return `${i.city} · ${MODE_LABEL[i.mode]}`;
}

export function formatDuration(weeks: number) {
  if (weeks % 4 === 0 && weeks >= 8) return `${weeks / 4} months`;
  return `${weeks} week${weeks === 1 ? '' : 's'}`;
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function timeAgo(date: string | Date) {
  const diff = (new Date(date).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return 'just now';
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
  return formatDate(date);
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function deadlineLabel(deadline?: string) {
  if (!deadline) return null;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return 'Deadline passed';
  if (days === 0) return 'Closes today';
  if (days <= 7) return `Closes in ${days} day${days === 1 ? '' : 's'}`;
  return `Apply by ${formatDate(deadline)}`;
}

export const STATUS_META: Record<ApplicationStatus, { label: string; tone: 'slate' | 'blue' | 'amber' | 'violet' | 'green' | 'red' }> = {
  applied: { label: 'Applied', tone: 'slate' },
  reviewing: { label: 'Under review', tone: 'blue' },
  interview: { label: 'Interview', tone: 'amber' },
  offered: { label: 'Offer', tone: 'violet' },
  hired: { label: 'Hired', tone: 'green' },
  rejected: { label: 'Not selected', tone: 'red' },
  withdrawn: { label: 'Withdrawn', tone: 'slate' },
};

export const formatBytes = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`);
