import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { CITIES } from '@shared/schemas';
import { useOverlayHeader } from './Layout';
import { cx } from './ui';
import './HomeHero.css';

/** Edit these to change the rotating words under "Find your next". */
const WORDS = ['internship', 'mentor', 'career', 'big break'];
const PLACEHOLDERS = ['Marketing internships in Karachi', 'Remote UI/UX design', 'Paid frontend internships in Lahore', 'Data analyst internships'];

/** Chips map onto the internships page's filters. Remote and Hybrid share the one work-mode filter. */
const FILTERS = [
  { label: 'Remote', key: 'mode', value: 'remote' },
  { label: 'Paid', key: 'paid', value: 'true' },
  { label: 'Hybrid', key: 'mode', value: 'hybrid' },
] as const;
type Filter = (typeof FILTERS)[number];

/**
 * Homepage hero (greyish white · blue · sky blue · silver): rotating headline, internship search,
 * filter chips and live stats. Design reference: HomeHero.jsx.
 */
export function HomeHero({
  stats,
  onSearch,
}: {
  /** Real numbers; entries at zero are hidden. */
  stats: { value?: number; label: string }[];
  /** Query string for the internships page, e.g. "q=react&city=Lahore&mode=remote". */
  onSearch: (params: URLSearchParams) => void;
}) {
  const overlay = useOverlayHeader();
  const h1 = useRef<HTMLHeadingElement>(null);
  const wordEls = useRef<(HTMLSpanElement | null)[]>([]);
  const index = useRef(0);
  const [current, setCurrent] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [widths, setWidths] = useState<number[]>([]);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [active, setActive] = useState<Filter[]>([]);
  const [ph, setPh] = useState(0);
  const [focused, setFocused] = useState(false);

  // Size the headline so "Find your next" and the widest word both fit, and remember each word's width.
  useLayoutEffect(() => {
    const el = h1.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = '';
      const max = el.parentElement!.clientWidth * 0.94;
      const line1 = el.querySelector<HTMLElement>('.in')!.scrollWidth;
      const widest = Math.max(line1, ...wordEls.current.map((w) => w?.offsetWidth ?? 0));
      if (widest > max) el.style.fontSize = `${Math.floor((parseFloat(getComputedStyle(el).fontSize) * max) / widest)}px`;
      setWidths(wordEls.current.map((w) => w?.offsetWidth ?? 0));
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // Rotate the word every 2.4s; the leaving word slides up and out.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      setLeaving(index.current);
      index.current = (index.current + 1) % WORDS.length;
      setCurrent(index.current);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  // Cycle the example searches while the box is empty and not focused.
  useEffect(() => {
    if (query || focused) return;
    const id = setInterval(() => setPh((p) => (p + 1) % PLACEHOLDERS.length), 3000);
    return () => clearInterval(id);
  }, [query, focused]);

  const toggle = (f: Filter) =>
    setActive((a) => (a.includes(f) ? a.filter((x) => x !== f) : [...a.filter((x) => x.key !== f.key), f]));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (query.trim()) p.set('q', query.trim());
    if (city) p.set('city', city);
    for (const f of active) p.set(f.key, f.value);
    onSearch(p);
  };

  // Floating sky-blue dots, placed once.
  const flies = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const s = Math.random() * 3 + 2;
        return {
          id: i,
          style: {
            left: `${Math.random() * 100}%`,
            width: `${s}px`,
            height: `${s}px`,
            opacity: 0.4 + Math.random() * 0.6,
            '--dx': `${(Math.random() - 0.5) * 160}px`,
            animationDuration: `${18 + Math.random() * 22}s, ${2 + Math.random() * 3}s`,
            animationDelay: `${-Math.random() * 40}s, ${-Math.random() * 3}s`,
          } as CSSProperties,
        };
      }),
    [],
  );

  const shownStats = stats.filter((s) => s.value);

  return (
    <section className={cx('home-hero', overlay && 'under-header')}>
      <div className="aurora" aria-hidden>
        <div className="ribbon r1" />
        <div className="ribbon r2" />
        <div className="ribbon r3" />
        {flies.map((f) => <span key={f.id} className="firefly" style={f.style} />)}
      </div>
      <div className="dots" aria-hidden />
      <div className="vignette" aria-hidden />
      <div className="sheen" aria-hidden />

      <h1 ref={h1} aria-label={`Find your next ${WORDS[0]}`}>
        <span className="line" aria-hidden>
          <span className="in">Find your next</span>
        </span>
        <span className="line" aria-hidden>
          <span className="in">
            <span className="rotator" style={{ width: widths[current] }}>
              {WORDS.map((w, i) => (
                <span
                  key={w}
                  ref={(el) => {
                    wordEls.current[i] = el;
                  }}
                  className={cx(i === current && 'show', i === leaving && 'out')}
                >
                  {w}
                </span>
              ))}
            </span>
          </span>
        </span>
      </h1>

      <p className="lead">Paid, remote and on-site internships from companies across Pakistan.</p>

      <form className="search" onSubmit={submit} role="search">
        <div className="q">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={PLACEHOLDERS[ph]}
            aria-label="Search internships"
          />
        </div>
        <div className="loc">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8592a6" strokeWidth="2" aria-hidden>
            <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">
            <option value="">Anywhere</option>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="go" type="submit" aria-label="Search">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>

      <div className="chips">
        {FILTERS.map((f) => (
          <button key={f.label} type="button" className={cx('chip', active.includes(f) && 'on')} aria-pressed={active.includes(f)} onClick={() => toggle(f)}>
            {f.label}
          </button>
        ))}
      </div>

      {shownStats.length > 0 && (
        <div className="stats">
          {shownStats.map((s) => (
            <div key={s.label}>
              <b>{s.value!.toLocaleString()}</b>
              {s.label}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
