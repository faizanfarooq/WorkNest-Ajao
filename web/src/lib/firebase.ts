// Public web-app config from the Firebase console. These identify the project; they are not secrets.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

/** Shown whenever the Firebase config is present, including the static demo (which handles it in-browser). */
export const GOOGLE_ENABLED = !!(config.apiKey && config.authDomain && config.projectId);

if (import.meta.env.DEV && !GOOGLE_ENABLED && Object.values(config).some(Boolean)) {
  const missing = Object.entries(config).filter(([, v]) => !v).map(([k]) => k);
  console.warn(`[firebase] Google sign-in is hidden: the Firebase config in .env is missing ${missing.join(', ')}. Restart the dev server after editing .env.`);
}

let loading: Promise<typeof import('./firebase-sdk')> | undefined;
/** Loads the Firebase SDK on demand so pages without the Google button don't pay for it. */
export const loadFirebase = () => (loading ??= import('./firebase-sdk'));

export const firebaseConfig = config;

export class GoogleSignInCancelled extends Error {}

const MESSAGES: Record<string, string> = {
  'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.',
  'auth/network-request-failed': "Couldn't reach Google. Check your connection and try again.",
  'auth/unauthorized-domain': "Google sign-in isn't enabled for this web address yet. Please contact support.",
  'auth/operation-not-allowed': "Google sign-in isn't enabled for WorkNest yet. Please contact support.",
  'auth/invalid-api-key': "Google sign-in isn't configured correctly. Please contact support.",
  'auth/too-many-requests': 'Too many sign-in attempts. Wait a few minutes and try again.',
  'auth/user-disabled': 'This Google account has been disabled.',
  'auth/web-storage-unsupported': 'Your browser settings block Google sign-in. Enable cookies and try again.',
};

/** Turns Firebase error codes into messages a person can act on. */
export function googleErrorMessage(err: unknown) {
  const code = (err as { code?: string })?.code ?? '';
  return MESSAGES[code] ?? 'Google sign-in failed. Please try again.';
}

/**
 * Opens Google's account chooser and returns a Firebase ID token for the server to verify.
 * Throws GoogleSignInCancelled when the person closes the popup.
 */
export async function getGoogleIdToken(): Promise<string> {
  const sdk = await loadFirebase();
  try {
    return await sdk.signInAndGetToken();
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request' || code === 'auth/user-cancelled') {
      throw new GoogleSignInCancelled();
    }
    throw new Error(googleErrorMessage(err));
  }
}
