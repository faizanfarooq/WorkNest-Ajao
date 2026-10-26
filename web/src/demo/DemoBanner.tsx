import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import { demoServer } from '../lib/api';

/** Strip above the header in the GitHub Pages build: explains the demo. Sign-in is Google only, like the real site. */
export function DemoBanner() {
  const reset = async () => {
    if (!confirm('Reset the demo? Everything you changed will be replaced with fresh sample data.')) return;
    await (await demoServer()).resetDemo();
    toast.success('Demo reset');
    window.location.assign(import.meta.env.BASE_URL);
  };

  return (
    <div className="bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-xs sm:px-6">
        <p className="text-slate-300">
          <span className="font-bold text-white">Demo.</span> Data is saved only in your browser. Sign in with Google to try it.
        </p>
        <button className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-slate-300 hover:text-white" onClick={reset}>
          <RotateCcw className="size-3.5" /> Reset
        </button>
      </div>
    </div>
  );
}
