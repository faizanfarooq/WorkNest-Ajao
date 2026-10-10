import type { InternshipInput } from './schemas.ts';

// Rough conversion used only to rank by pay across currencies; never shown to users.
const PKR_PER_USD = 280;
const WEEKS_PER_MONTH = 4.33;

/** Normalised monthly PKR figure so "sort by pay" compares like with like. */
export function monthlyPkr(i: Pick<InternshipInput, 'paid' | 'payAmount' | 'payCurrency' | 'payPeriod' | 'durationWeeks'>) {
  if (!i.paid) return 0;
  const pkr = i.payCurrency === 'USD' ? i.payAmount * PKR_PER_USD : i.payAmount;
  if (i.payPeriod === 'week') return Math.round(pkr * WEEKS_PER_MONTH);
  if (i.payPeriod === 'total') return Math.round(pkr / Math.max(i.durationWeeks / WEEKS_PER_MONTH, 1));
  return pkr;
}
