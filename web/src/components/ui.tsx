import {
  forwardRef,
  useEffect,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { Link, type LinkProps } from 'react-router';
import { BadgeCheck, Loader2, X } from 'lucide-react';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

// ---------- Buttons ----------

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 shadow-sm',
  secondary: 'bg-white text-ink border border-slate-300 hover:bg-slate-50 shadow-sm',
  ghost: 'text-slate-700 hover:bg-slate-100',
  danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50',
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', extra?: string) =>
  cx(
    'inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
    variants[variant],
    sizes[size],
    extra,
  );

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, loading, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export function ButtonLink({ variant, size, className, ...rest }: LinkProps & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />;
}

// ---------- Form fields ----------

const fieldBase =
  'w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-slate-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 disabled:bg-slate-50';
const fieldBorder = (error?: string) => (error ? 'border-red-400' : 'border-slate-300');

interface FieldShellProps {
  label?: string;
  hint?: string;
  error?: string;
  id: string;
  children: ReactNode;
  optional?: boolean;
}

function FieldShell({ label, hint, error, id, children, optional }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-800">
          {label} {optional && <span className="font-normal text-slate-400">(optional)</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

type FieldExtras = { label?: string; hint?: string; error?: string; optional?: boolean };

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldExtras>(function Input(
  { label, hint, error, optional, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell label={label} hint={hint} error={error} id={fid} optional={optional}>
      <input ref={ref} id={fid} aria-invalid={!!error} className={cx(fieldBase, fieldBorder(error), 'h-10', className)} {...rest} />
    </FieldShell>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldExtras>(
  function Textarea({ label, hint, error, optional, className, id, ...rest }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <FieldShell label={label} hint={hint} error={error} id={fid} optional={optional}>
        <textarea ref={ref} id={fid} aria-invalid={!!error} className={cx(fieldBase, fieldBorder(error), 'py-2.5 min-h-24', className)} {...rest} />
      </FieldShell>
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldExtras>(function Select(
  { label, hint, error, optional, className, id, children, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell label={label} hint={hint} error={error} id={fid} optional={optional}>
      <select ref={ref} id={fid} aria-invalid={!!error} className={cx(fieldBase, fieldBorder(error), 'h-10 pr-8', className)} {...rest}>
        {children}
      </select>
    </FieldShell>
  );
});

/** Free-text chips, e.g. skills. Enter or comma adds; backspace on empty removes the last. */
export function TagInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  max = 20,
}: {
  label?: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  max?: number;
}) {
  const id = useId();
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '');
    if (!tag || value.length >= max || value.some((v) => v.toLowerCase() === tag.toLowerCase())) return setDraft('');
    onChange([...value, tag]);
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <FieldShell label={label} hint={hint ?? 'Press Enter to add'} error={error} id={id}>
      <div className={cx(fieldBase, fieldBorder(error), 'flex min-h-10 flex-wrap items-center gap-1.5 py-1.5 focus-within:ring-2 focus-within:ring-brand-600/30 focus-within:border-brand-600')}>
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800">
            {tag}
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))} className="text-brand-700 hover:text-brand-900">
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          placeholder={value.length ? '' : placeholder}
          className="min-w-24 flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-slate-400"
        />
      </div>
    </FieldShell>
  );
}

export function Checkbox({ label, description, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  const id = useId();
  return (
    <div className="flex gap-3">
      <input id={id} type="checkbox" className="mt-0.5 size-4 rounded border-slate-300 accent-brand-700" {...rest} />
      <label htmlFor={id} className="text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        {description && <span className="block text-slate-500">{description}</span>}
      </label>
    </div>
  );
}

// ---------- Display ----------

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('rounded-xl border border-slate-200 bg-white', className)}>{children}</div>;
}

const tones = {
  slate: 'bg-slate-100 text-slate-700',
  blue: 'bg-sky-50 text-sky-800 ring-sky-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  violet: 'bg-violet-50 text-violet-800 ring-violet-200',
  green: 'bg-brand-50 text-brand-800 ring-brand-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
} as const;

export function Badge({ tone = 'slate', children, className }: { tone?: keyof typeof tones; children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', tones[tone], className)}>
      {children}
    </span>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">{children}</span>;
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cx('size-5 animate-spin text-slate-400', className)} aria-label="Loading" />;
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="size-7" />
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon && <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-500">{icon}</div>}
      <p className="font-semibold text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-slate-500">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <EmptyState
      title="Something went wrong"
      body={error instanceof Error ? error.message : 'Please try again.'}
      action={retry && <Button variant="secondary" onClick={retry}>Try again</Button>}
    />
  );
}

const palette = ['bg-emerald-600', 'bg-sky-600', 'bg-violet-600', 'bg-amber-600', 'bg-rose-600', 'bg-teal-600', 'bg-indigo-600', 'bg-orange-600'];
const colorFor = (s: string) => palette[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
const initials = (s: string) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

export function Avatar({ name, src, size = 'md', square }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; square?: boolean }) {
  const dims = { sm: 'size-8 text-xs', md: 'size-11 text-sm', lg: 'size-14 text-lg', xl: 'size-20 text-2xl' }[size];
  const shape = square ? 'rounded-xl' : 'rounded-full';
  const [broken, setBroken] = useState(false);
  if (src && !broken) {
    return <img src={src} alt="" onError={() => setBroken(true)} className={cx(dims, shape, 'shrink-0 border border-slate-200 bg-white object-cover')} />;
  }
  return (
    <div aria-hidden className={cx(dims, shape, colorFor(name), 'flex shrink-0 items-center justify-center font-bold text-white')}>
      {initials(name)}
    </div>
  );
}

export function CompanyName({ name, verified }: { name: string; verified?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      {name}
      {verified && <BadgeCheck className="size-4 text-brand-600" aria-label="Verified company" />}
    </span>
  );
}

// ---------- Modal ----------

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={cx('flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-lg')}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
