import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IS_DEMO, api } from '../lib/api';

interface GoogleIdentity {
  initialize(opts: { client_id: string; callback: (res: { credential: string }) => void }): void;
  renderButton(el: HTMLElement, opts: Record<string, unknown>): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

let script: Promise<void> | undefined;

function loadGoogleScript() {
  script ??= new Promise<void>((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = 'https://accounts.google.com/gsi/client';
    tag.async = true;
    tag.onload = () => resolve();
    tag.onerror = () => {
      script = undefined;
      reject(new Error('Could not load Google sign-in'));
    };
    document.head.appendChild(tag);
  });
  return script;
}

/**
 * Google's own "Continue with Google" button, followed by an "or" divider.
 * Renders nothing when the server has no Google client ID configured, and in the demo build.
 */
export function GoogleButton({
  text = 'continue_with',
  onCredential,
}: {
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  onCredential: (credential: string) => void;
}) {
  const { data } = useQuery({
    queryKey: ['auth-providers'],
    queryFn: () => api<{ googleClientId: string | null }>('/auth/providers'),
    enabled: !IS_DEMO,
    staleTime: Infinity,
  });
  const clientId = data?.googleClientId;
  const el = useRef<HTMLDivElement>(null);
  // Google keeps the callback from initialize(), so route it through a ref to always call the latest handler.
  const handler = useRef(onCredential);
  useEffect(() => {
    handler.current = onCredential;
  });

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !el.current || !window.google) return;
        window.google.accounts.id.initialize({ client_id: clientId, callback: (res) => handler.current(res.credential) });
        window.google.accounts.id.renderButton(el.current, {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text,
          width: Math.min(400, el.current.offsetWidth || 320),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [clientId, text]);

  if (!clientId) return null;
  return (
    <div>
      <div ref={el} className="flex min-h-11 justify-center" />
      <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
