import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import type { Company } from '../lib/types';
import { AuroraBackground } from './AuroraBackground';
import { useOverlayHeader } from './Layout';
import { cx } from './ui';
import './CompaniesHero.css';

const PLACEHOLDERS = ['Search companies, e.g. fintech in Lahore', 'Remote design studios', 'Startups hiring interns', 'Companies with paid internships'];
const TILE_COLORS = ['#6366f1', '#0ea5e9', '#f97316', '#10b981', '#8b5cf6', '#14b8a6', '#22c55e', '#ec4899'];

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Counts up from 0 to `end`; jumps straight there when motion is reduced. */
function useCountUp(end: number, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setValue(end);
    const start = performance.now();
    let raf = requestAnimationFrame(function step(t) {
      const p = Math.min((t - start) / duration, 1);
      setValue(Math.round(end * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return value;
}

/**
 * Companies page hero: aurora background, "SHOW UP / GET HIRED", a company search, industry chips
 * and a "Hiring interns right now" strip, all from the real company list.
 */
export function CompaniesHero({
  companies,
  industry,
  onSearch,
  onIndustryChange,
}: {
  /** Every company, unfiltered. */
  companies: Company[];
  industry: string;
  onSearch: (query: string) => void;
  onIndustryChange: (industry: string) => void;
}) {
  const overlay = useOverlayHeader();
  const hiring = companies.filter((c) => (c.openRoles ?? 0) > 0);
  const count = useCountUp(hiring.length);
  const industries = ['All', ...[...new Set(companies.map((c) => c.industry?.trim()).filter((i): i is string => !!i))].sort()];
  const [query, setQuery] = useState('');
  const [phIndex, setPhIndex] = useState(0);

  // Rotate the search placeholder while the box is empty.
  useEffect(() => {
    if (query) return;
    const id = setInterval(() => setPhIndex((i) => (i + 1) % PLACEHOLDERS.length), 3000);
    return () => clearInterval(id);
  }, [query]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  // Listed twice so the strip loops seamlessly; the copy is hidden from assistive tech.
  const loop = [...hiring, ...hiring];

  return (
    <section className={cx('co-hero', overlay ? 'under-header' : 'in-app')}>
      <AuroraBackground />
      <div className="vignette" aria-hidden />
      <div className="noise" aria-hidden />

      <h1>
        <span className="line"><span className="in">Show up</span></span>
        <span className="line"><span className="in">Get hired</span></span>
      </h1>

      <p className="sub">
        {hiring.length > 0 ? (
          <>
            <b>{count}</b> {hiring.length === 1 ? 'company is' : 'companies are'} hiring interns on WorkNest. Find a team you'd love to join.
          </>
        ) : (
          <>Companies are joining WorkNest to hire interns. Find a team you'd love to join.</>
        )}
      </p>

      <form className="csearch" onSubmit={submit} role="search">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8fa69e" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={PLACEHOLDERS[phIndex]} aria-label="Search companies" />
        <button type="submit">Explore</button>
      </form>

      {industries.length > 1 && (
        <div className="inds">
          {industries.map((name) => (
            <button key={name} type="button" className={cx('ind', industry === name && 'on')} aria-pressed={industry === name} onClick={() => onIndustryChange(name)}>
              {name}
            </button>
          ))}
        </div>
      )}

      {hiring.length > 0 && (
        <div className="marquee-wrap">
          <div className="marquee-label"><span className="live" aria-hidden />Hiring interns right now</div>
          <div className="marquee">
            <div className="track">
              {loop.map((c, i) => {
                const copy = i >= hiring.length;
                return (
                  <Link key={`${c._id}-${i}`} className="co" to={`/companies/${c.slug}`} aria-hidden={copy || undefined} tabIndex={copy ? -1 : undefined}>
                    <div className="lg" style={{ background: TILE_COLORS[(i % hiring.length) % TILE_COLORS.length] }}>
                      {c.logoUrl ? <img src={c.logoUrl} alt="" /> : c.name[0]}
                    </div>
                    <div>
                      <b>{c.name}</b>
                      <small>{[c.industry, c.city].filter(Boolean).join(' · ')}</small>
                    </div>
                    <span className="roles">{plural(c.openRoles ?? 0, 'role', 'roles')}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
