import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { cx } from './ui';

/**
 * Floating "Back to top" button, shown once the page has scrolled `threshold` pixels.
 * Signed-in phones have the tab bar along the bottom, so it sits above that.
 */
export function BackToTop({ threshold = 600 }: { threshold?: number }) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      title="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cx(
        'fixed right-4 z-20 inline-flex items-center gap-2 rounded-full bg-brand-700 p-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition-all duration-300 hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:right-6 sm:px-4 sm:py-2.5',
        user ? 'bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6' : 'bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-6',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <ArrowUp className="size-5 sm:size-4" aria-hidden />
      <span className="hidden sm:inline">Back to top</span>
    </button>
  );
}
