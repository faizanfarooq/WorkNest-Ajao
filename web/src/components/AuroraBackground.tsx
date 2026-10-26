import { useMemo, type CSSProperties } from 'react';

/**
 * Soft green aurora ribbons and rising fireflies, styled by CompaniesHero.css.
 * Place inside a parent with `position: relative`.
 */
export function AuroraBackground({ fireflies = 34 }: { fireflies?: number }) {
  // Random positions are generated once so they don't jump on re-render.
  const flies = useMemo(
    () =>
      Array.from({ length: fireflies }, (_, i) => {
        const size = Math.random() * 3 + 2;
        return {
          id: i,
          style: {
            left: `${Math.random() * 100}%`,
            width: `${size}px`,
            height: `${size}px`,
            opacity: 0.4 + Math.random() * 0.6,
            '--dx': `${(Math.random() - 0.5) * 160}px`,
            animationDuration: `${18 + Math.random() * 22}s, ${2 + Math.random() * 3}s`,
            animationDelay: `${-Math.random() * 40}s, ${-Math.random() * 3}s`,
          } as CSSProperties,
        };
      }),
    [fireflies],
  );

  return (
    <div className="aurora" aria-hidden>
      <div className="ribbon r1" />
      <div className="ribbon r2" />
      <div className="ribbon r3" />
      {flies.map((f) => (
        <span key={f.id} className="firefly" style={f.style} />
      ))}
    </div>
  );
}
