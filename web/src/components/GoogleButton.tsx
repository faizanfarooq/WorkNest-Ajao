import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GOOGLE_ENABLED, GoogleSignInCancelled, getGoogleIdToken, loadFirebase } from '../lib/firebase';

const LABELS = {
  signin_with: 'Sign in with Google',
  signup_with: 'Sign up with Google',
  continue_with: 'Continue with Google',
} as const;

/** Google's "G" mark, per Google's sign-in branding guidelines. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/**
 * "Continue with Google" button, followed by an "or" divider. Opens Google's account chooser through
 * Firebase and hands the resulting ID token to `onCredential` for the server to verify.
 * Renders nothing when Firebase isn't configured, and in the demo build.
 */
export function GoogleButton({
  text = 'continue_with',
  canStart,
  onCredential,
}: {
  text?: keyof typeof LABELS;
  /** Checked before the popup opens; return false to stop (e.g. a required field is empty). */
  canStart?: () => boolean;
  onCredential: (credential: string) => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  // Fetch the SDK as soon as the button shows, so the popup opens straight from the click.
  useEffect(() => {
    if (GOOGLE_ENABLED) void loadFirebase();
  }, []);

  if (!GOOGLE_ENABLED) return null;

  const onClick = async () => {
    if (canStart && !canStart()) return;
    setBusy(true);
    try {
      await onCredential(await getGoogleIdToken());
    } catch (err) {
      if (!(err instanceof GoogleSignInCancelled)) toast.error(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#747775] bg-white px-4 text-sm font-medium text-[#1f1f1f] transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? <Loader2 className="size-5 animate-spin text-slate-500" aria-hidden /> : <GoogleMark />}
        {busy ? 'Waiting for Google…' : LABELS[text]}
      </button>
      <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
