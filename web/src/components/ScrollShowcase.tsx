import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from './ui';
import s from './ScrollShowcase.module.css';

interface Step {
  icon: ReactNode;
  title: string;
  text: string;
  /** App screen shown on the phone for this step. */
  screen: ReactNode;
  /** Presets from the CSS module. */
  tilt: string;
  glow: string;
}

const iconProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Add a step here and the section grows to fit it. */
const STEPS: Step[] = [
  {
    icon: (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    ),
    title: 'Discover internships made for you',
    text: 'Smart matches from companies across Pakistan, refreshed every day based on your skills and interests.',
    tilt: s.tiltLeft,
    glow: s.glowTeal,
    screen: (
      <>
        <div className={s.search}>⌕ &nbsp;Search internships</div>
        <div className={s.chips}>
          <span className={cx(s.chip, s.chipOn)}>Remote</span>
          <span className={s.chip}>Lahore</span>
          <span className={s.chip}>Paid</span>
        </div>
        <h4>Matched for you</h4>
        {[
          ['N', s.indigo, 'Frontend Intern', 'Nexa Labs · Lahore', '98%'],
          ['B', s.sky, 'UI/UX Design Intern', 'Bluepine · Remote', '94%'],
          ['C', s.orange, 'Data Analyst Intern', 'Codewave · Karachi', '89%'],
          ['S', s.green, 'Marketing Intern', 'Sprout · Islamabad', '86%'],
        ].map(([letter, color, title, meta, match]) => (
          <div key={title} className={s.job}>
            <div className={cx(s.logo, color)}>{letter}</div>
            <div>
              <div className={s.jobTitle}>{title}</div>
              <div className={s.muted}>{meta}</div>
            </div>
            <span className={s.tag}>{match}</span>
          </div>
        ))}
      </>
    ),
  },
  {
    icon: (
      <svg {...iconProps}>
        <path d="M12 3l2.6 5.6L20 9.5l-4 4 1 5.5-5-2.7-5 2.7 1-5.5-4-4 5.4-.9z" />
      </svg>
    ),
    title: 'Build skills employers want',
    text: 'Short, real-world challenges designed with hiring teams, so what you practise is what they hire for.',
    tilt: s.tiltRight,
    glow: s.glowGreen,
    screen: (
      <>
        <h4>This week's challenge</h4>
        <div className={s.heroCard}>
          <b>Build a job-board landing page</b>
          <span className={s.muted}>5 days left · 320 joined</span>
        </div>
        <h4 className={s.spaced}>Your skills</h4>
        {[
          ['React basics', '80%', s.w80],
          ['UI design', '65%', s.w65],
          ['Interview prep', '40%', s.w40],
        ].map(([name, pct, width]) => (
          <div key={name} className={s.skill}>
            <div className={s.skillRow}>
              <span>{name}</span>
              <span>{pct}</span>
            </div>
            <div className={s.bar}>
              <i className={width} />
            </div>
          </div>
        ))}
      </>
    ),
  },
  {
    icon: (
      <svg {...iconProps}>
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4z" />
      </svg>
    ),
    title: 'Apply in one tap, track every step',
    text: 'Your profile becomes your resume. Follow each application from applied to offer, all in one place.',
    tilt: s.tiltSoft,
    glow: s.glowAmber,
    screen: (
      <>
        <h4>Your applications</h4>
        <div className={s.stats}>
          <div className={s.stat}><b>6</b><span className={s.muted}>Applied</span></div>
          <div className={s.stat}><b>3</b><span className={s.muted}>In review</span></div>
          <div className={s.stat}><b>2</b><span className={s.muted}>Interviews</span></div>
          <div className={cx(s.stat, s.offer)}><b>1</b><span className={s.muted}>Offer 🎉</span></div>
        </div>
        {[
          ['N', s.indigo, 'Nexa Labs', s.off, 'Offer'],
          ['B', s.sky, 'Bluepine', s.int, 'Interview'],
          ['C', s.orange, 'Codewave', s.rev, 'In review'],
        ].map(([letter, color, name, pill, status]) => (
          <div key={name} className={s.app}>
            <div className={cx(s.logo, s.logoSm, color)}>{letter}</div>
            {name}
            <span className={cx(s.pill, pill)}>{status}</span>
          </div>
        ))}
      </>
    ),
  },
];

/**
 * Tall section with a sticky dark card. Scrolling through it steps a 3D phone, its screen,
 * the copy, the glow and the progress dots through STEPS.
 */
export function ScrollShowcase() {
  const section = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const n = STEPS.length;

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const el = section.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const progress = Math.min(Math.max(-el.getBoundingClientRect().top / total, 0), 0.9999);
      setStep(Math.floor(progress * n));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [n]);

  /** Scrolls to the middle of step `i`'s stretch of the section. */
  const jumpTo = (i: number) => {
    const el = section.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + total * ((i + 0.5) / n);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section ref={section} className={s.showcase} style={{ '--steps': n } as React.CSSProperties} aria-label="How WorkNest helps">
      <div className={s.stage} data-step={step}>
        {STEPS.map((st, i) => (
          <div key={st.title} className={cx(s.glow, st.glow, i === step && s.active)} aria-hidden />
        ))}

        <div className={s.phoneCol} aria-hidden>
          <div className={s.float}>
            <div className={cx(s.phone, STEPS[step].tilt)}>
              <div className={s.screen}>
                <div className={s.notch} />
                <div className={s.status}>
                  <span>9:41</span>
                  <span>●●● ▮</span>
                </div>
                <div className={s.appTop}>
                  <div className={s.brand}>
                    work<b>nest</b>
                  </div>
                  <div className={s.avatar} />
                </div>
                <div className={s.screens}>
                  {STEPS.map((st, i) => (
                    <div key={st.title} className={cx(s.scr, i === step && s.active)}>
                      {st.screen}
                    </div>
                  ))}
                </div>
                <div className={s.tabbar}>
                  {[0, 1, 2, 3].map((t) => <span key={t} className={cx(t === step && s.active)} />)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.copyCol}>
          {STEPS.map((st, i) => (
            <div key={st.title} className={cx(s.feature, i === step && s.active)} aria-hidden={i !== step}>
              {st.icon}
              <h3>{st.title}</h3>
              <p>{st.text}</p>
            </div>
          ))}
          <div className={s.dots}>
            {STEPS.map((st, i) => (
              <button key={st.title} type="button" className={cx(i === step && s.active)} aria-label={`Step ${i + 1}: ${st.title}`} aria-current={i === step} onClick={() => jumpTo(i)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
