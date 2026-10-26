import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { cx } from './ui';
import s from './GreetingHero.module.css';

type Phase = 'morning' | 'afternoon' | 'evening' | 'night';

const PHASES: Record<Phase, { label: string; greeting: string; sub: string }> = {
  morning: { label: 'Morning', greeting: 'Good morning', sub: 'Fresh internships landed while you slept.' },
  afternoon: { label: 'Afternoon', greeting: 'Good afternoon', sub: 'Keep the momentum going — new roles are waiting.' },
  evening: { label: 'Evening', greeting: 'Good evening', sub: 'Wind down with roles picked just for you.' },
  night: { label: 'Night', greeting: 'Still hustling', sub: 'Your next opportunity is one click away.' },
};

function phaseForHour(h: number): Phase {
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

/** Re-reads the clock every 30 seconds. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/**
 * "Good morning, {name}" hero whose sky, sun/moon and wording follow the viewer's local time.
 * Design reference: worknest-header-demo.html.
 */
export function GreetingHero({ name }: { name: string }) {
  const now = useNow();
  const phase = phaseForHour(now.getHours());
  const { label, greeting, sub } = PHASES[phase];
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Placed once per mount so the stars don't jump around on every clock tick.
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 70}%`,
        size: Math.random() < 0.15 ? 3 : 2,
        delay: `${(Math.random() * 3).toFixed(2)}s`,
      })),
    [],
  );

  return (
    <section className={s.hero} data-phase={phase}>
      <div className={cx(s.sky, s.morning)} aria-hidden />
      <div className={cx(s.sky, s.afternoon)} aria-hidden />
      <div className={cx(s.sky, s.evening)} aria-hidden />
      <div className={cx(s.sky, s.night)} aria-hidden />
      <div className={s.stars} aria-hidden>
        {stars.map((st, n) => (
          <span key={n} className={s.star} style={{ left: st.left, top: st.top, width: st.size, height: st.size, animationDelay: st.delay }} />
        ))}
      </div>
      <div className={s.grid} aria-hidden />

      <div className={s.orbWrap} aria-hidden>
        <div className={s.ring} />
        <div className={cx(s.orb, s.sun)} />
        <div className={cx(s.orb, s.moon)} />
      </div>

      {/* Nest with egg */}
      <svg className={s.nest} viewBox="0 0 120 90" aria-hidden>
        <ellipse cx="60" cy="34" rx="17" ry="21" fill="#F59E0B" />
        <ellipse cx="54" cy="27" rx="5" ry="7" fill="#fff" opacity=".45" />
        <g fill="none" stroke="#7c4a1e" strokeWidth="7" strokeLinecap="round">
          <path d="M10 46 Q60 104 110 46" />
        </g>
        <g fill="none" stroke="#a8692f" strokeWidth="5" strokeLinecap="round">
          <path d="M18 58 Q64 88 106 52" />
          <path d="M14 52 Q52 90 98 62" />
        </g>
      </svg>

      <svg className={cx(s.sparkle, s.s1)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
        <path d="M12 3 L13.8 10.2 L21 12 L13.8 13.8 L12 21 L10.2 13.8 L3 12 L10.2 10.2 Z" />
      </svg>
      <svg className={cx(s.sparkle, s.s2)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
        <path d="M12 3 L13.8 10.2 L21 12 L13.8 13.8 L12 21 L10.2 13.8 L3 12 L10.2 10.2 Z" />
      </svg>

      {/* Keyed on the phase so the fade-in replays when it changes. */}
      <div className={s.content} key={phase}>
        <span className={cx(s.chip, s.fadeUp)}>
          <span className={s.dot} aria-hidden />
          {label} · {time}
        </span>
        <h1 className={cx(s.title, s.fadeUp, s.d1)}>
          {greeting},
          <br />
          {name}
        </h1>
        <p className={cx(s.sub, s.fadeUp, s.d2)}>{sub}</p>
        <Link to="/internships" className={cx(s.cta, s.fadeUp, s.d3)}>
          Browse internships <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
