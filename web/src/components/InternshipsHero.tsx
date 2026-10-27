import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { History, X } from 'lucide-react';
import { CITIES } from '@shared/schemas';
import { MODE_LABEL } from '../lib/format';
import type { Internship, RecentSearch } from '../lib/types';
import { useOverlayHeader } from './Layout';
import { cx } from './ui';
import s from './InternshipsHero.module.css';

const EXAMPLES = ['Frontend internships in Lahore', 'Remote UI/UX design', 'Paid data analyst internships', 'Marketing internships in Karachi'];

/** Types out example searches in the placeholder; holds still while the field is focused or filled. */
function useTypewriter(input: React.RefObject<HTMLInputElement | null>) {
  const [placeholder, setPlaceholder] = useState('');
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setPlaceholder(EXAMPLES[0]);
    let ei = 0;
    let ci = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const type = () => {
      const el = input.current;
      if (el && (document.activeElement === el || el.value)) {
        setPlaceholder(EXAMPLES[ei]);
        timer = setTimeout(type, 600);
        return;
      }
      const word = EXAMPLES[ei];
      ci += deleting ? -1 : 1;
      setPlaceholder(word.slice(0, ci));
      let delay = deleting ? 35 : 70;
      if (!deleting && ci === word.length) {
        deleting = true;
        delay = 1800;
      } else if (deleting && ci === 0) {
        deleting = false;
        ei = (ei + 1) % EXAMPLES.length;
        delay = 300;
      }
      timer = setTimeout(type, delay);
    };
    timer = setTimeout(type, 1200);
    return () => clearTimeout(timer);
  }, [input]);
  return placeholder;
}

/** Shrinks the headline so its longest line never overflows the card. */
function useFitHeadline(h1: React.RefObject<HTMLHeadingElement | null>) {
  useLayoutEffect(() => {
    const el = h1.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = '';
      const max = el.parentElement!.clientWidth * 0.92;
      const widest = Math.max(...Array.from(el.querySelectorAll<HTMLElement>(`.${s.line}`), (l) => l.scrollWidth));
      if (widest > max) el.style.fontSize = `${Math.floor((parseFloat(getComputedStyle(el).fontSize) * max) / widest)}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [h1]);
}

export interface HeroChip {
  label: string;
  active: boolean;
  onToggle: () => void;
}

/**
 * Hero card at the top of the Find internships page: aurora background, tilted phone,
 * giant headline, search, filter chips and live stats.
 */
export function InternshipsHero({
  keywords,
  city,
  onKeywords,
  onCity,
  onSearch,
  chips,
  stats,
  latest,
  recent = [],
  onRecent,
  onRemoveRecent,
  onClearRecent,
}: {
  keywords: string;
  city: string;
  onKeywords: (v: string) => void;
  onCity: (v: string) => void;
  onSearch: (e: FormEvent) => void;
  chips: HeroChip[];
  stats: { internships?: number; companies?: number };
  /** Newest internships, shown on the phone mockup. */
  latest: Internship[];
  /** The signed-in student's recent searches; the row is hidden when empty. */
  recent?: RecentSearch[];
  onRecent?: (r: RecentSearch) => void;
  onRemoveRecent?: (r: RecentSearch) => void;
  onClearRecent?: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const placeholder = useTypewriter(input);
  useFitHeadline(h1);
  const overlay = useOverlayHeader();

  return (
    <section className={cx(s.hero, overlay && s.underHeader)}>
      <div className={cx(s.blob, s.b1)} aria-hidden />
      <div className={cx(s.blob, s.b2)} aria-hidden />
      <div className={cx(s.blob, s.b3)} aria-hidden />
      <div className={cx(s.blob, s.b4)} aria-hidden />

      {/* Phone sits behind the headline */}
      <div className={s.phoneWrap} aria-hidden>
        <div className={s.phone}>
          <div className={s.screen}>
            <div className={s.island} />
            <div className={s.status}>
              <span>9:41</span>
              <span>●●● ▮</span>
            </div>
            <div className={s.pTop}>
              <h5>Find internships</h5>
              <div className={s.pAvatar} />
            </div>
            <div className={s.pSearch}>⌕ &nbsp;Frontend · Lahore</div>
            <div className={s.pFeature}>
              <div className={s.pOrb} />
              <span>✦ Quick apply</span>
            </div>
            {/* Wrapped so the logo colours can follow each row's position. */}
            <div>
            {latest.slice(0, 3).map((i) => (
              <div key={i._id} className={s.pJob}>
                <div className={s.pLogo}>{i.company?.name[0] ?? '?'}</div>
                <div>
                  <b>{i.title}</b>
                  <small>
                    {i.company?.name} · {i.mode === 'remote' ? 'Remote' : i.city}
                  </small>
                </div>
                <em>{MODE_LABEL[i.mode]}</em>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div className={cx(s.toast, s.t1)} aria-hidden>
        <i>✓</i>
        <div>
          Application sent
          <small>Track it in My applications</small>
        </div>
      </div>
      {!!stats.internships && (
        <div className={cx(s.toast, s.t2)} aria-hidden>
          <i>★</i>
          <div>
            {stats.internships} open now
            <small>Paid, remote and on-site</small>
          </div>
        </div>
      )}

      <h1 ref={h1} className={s.title}>
        <span className={s.line}>
          <span className={s.word}>Find</span> <span className={s.word}>your</span>
        </span>
        <span className={s.line}>
          <span className={s.word}>first</span> <span className={cx(s.word, s.accent)}>internship</span>
        </span>
      </h1>

      <p className={s.lead}>
        Paid, remote and on-site internships from companies across Pakistan. Build your profile once and apply in one tap — free for students.
      </p>

      <form className={s.search} onSubmit={onSearch} role="search">
        <div className={s.q}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            ref={input}
            className={s.input}
            value={keywords}
            onChange={(e) => onKeywords(e.target.value)}
            placeholder={placeholder}
            aria-label="Search internships"
          />
        </div>
        <label className={s.loc}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" aria-hidden>
            <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          <span className="sr-only">City</span>
          <select value={city} onChange={(e) => onCity(e.target.value)}>
            <option value="">Anywhere</option>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <button type="submit" className={s.go} aria-label="Search">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>

      {recent.length > 0 && (
        <div className={s.recent} role="group" aria-label="Recent searches">
          <span className={s.recentLabel}>
            <History className="size-4" aria-hidden /> Recent
          </span>
          {recent.map((r) => (
            <span key={r._id} className={s.recentChip}>
              <button type="button" className={s.recentRun} onClick={() => onRecent?.(r)} title={`Search again: ${r.q}${r.city ? ` in ${r.city}` : ''}`}>
                {r.q}
                {r.city && <span className={s.recentCity}> · {r.city}</span>}
              </button>
              <button type="button" className={s.recentRemove} onClick={() => onRemoveRecent?.(r)} aria-label={`Remove "${r.q}" from recent searches`}>
                <X className="size-3.5" aria-hidden />
              </button>
            </span>
          ))}
          <button type="button" className={s.recentClear} onClick={onClearRecent}>Clear</button>
        </div>
      )}

      <div className={s.chips}>
        {chips.map((c) => (
          <button
            key={c.label}
            type="button"
            className={cx(s.chip, c.active && s.on)}
            aria-pressed={c.active}
            onClick={c.onToggle}
          >
            {c.label}
          </button>
        ))}
      </div>

      {(!!stats.internships || !!stats.companies) && (
        <div className={s.stats}>
          {!!stats.internships && (
            <div>
              <b>{stats.internships.toLocaleString()}</b>
              <span>open {stats.internships === 1 ? 'internship' : 'internships'}</span>
            </div>
          )}
          {!!stats.companies && (
            <div>
              <b>{stats.companies.toLocaleString()}</b>
              <span>hiring {stats.companies === 1 ? 'company' : 'companies'}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
