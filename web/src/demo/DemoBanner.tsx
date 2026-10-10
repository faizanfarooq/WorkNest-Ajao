import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Briefcase, GraduationCap, RotateCcw } from 'lucide-react';
import { DEMO_EMPLOYER_EMAIL, DEMO_PASSWORD, DEMO_STUDENT_EMAIL } from '@shared/seed-data';
import { demoServer } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toastError } from '../lib/forms';
import { cx } from '../components/ui';

/** Strip above the header in the GitHub Pages build: explains the demo and switches accounts in one click. */
export function DemoBanner() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const switchTo = async (email: string) => {
    if (user?.email === email) return navigate('/dashboard');
    setBusy(true);
    try {
      if (user) await logout();
      await login({ email, password: DEMO_PASSWORD });
      navigate('/dashboard');
    } catch (err) {
      toastError(err);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!confirm('Reset the demo? Everything you changed will be replaced with fresh sample data.')) return;
    await (await demoServer()).resetDemo();
    toast.success('Demo reset');
    window.location.assign(import.meta.env.BASE_URL);
  };

  const pill = (active: boolean) =>
    cx(
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50',
      active ? 'bg-white text-ink' : 'bg-white/15 text-white hover:bg-white/25',
    );

  return (
    <div className="bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-xs sm:px-6">
        <p className="text-slate-300">
          <span className="font-bold text-white">Demo.</span> Data is saved only in your browser.
        </p>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="hidden text-slate-400 sm:inline">View as:</span>
          <button className={pill(user?.email === DEMO_STUDENT_EMAIL)} onClick={() => switchTo(DEMO_STUDENT_EMAIL)} disabled={busy}>
            <GraduationCap className="size-3.5" /> Student
          </button>
          <button className={pill(user?.email === DEMO_EMPLOYER_EMAIL)} onClick={() => switchTo(DEMO_EMPLOYER_EMAIL)} disabled={busy}>
            <Briefcase className="size-3.5" /> Employer
          </button>
          <button className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-slate-300 hover:text-white" onClick={reset}>
            <RotateCcw className="size-3.5" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
