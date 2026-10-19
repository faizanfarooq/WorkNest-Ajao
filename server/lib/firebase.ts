import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from '../config/env.ts';
import { HttpError, badRequest, unauthorized } from './http.ts';

export interface GoogleIdentity {
  /** Google's account ID ("sub"), stable across Firebase projects. */
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
}

type Verifier = (idToken: string) => Promise<GoogleIdentity>;

/**
 * Verifies a Firebase ID token from the Google popup. Only needs the project ID:
 * firebase-admin checks the signature against Google's public keys, plus audience, issuer and expiry.
 */
const firebaseVerifier: Verifier = async (idToken) => {
  const projectId = env().FIREBASE_PROJECT_ID;
  if (!projectId) throw new HttpError(503, 'Google sign-in is not set up on this server');
  const app = getApps()[0] ?? initializeApp({ projectId });

  const decoded = await getAuth(app)
    .verifyIdToken(idToken)
    .catch(() => null);
  if (!decoded) throw unauthorized('Google sign-in could not be verified. Please try again.');

  const googleId = decoded.firebase.identities?.['google.com']?.[0];
  if (decoded.firebase.sign_in_provider !== 'google.com' || typeof googleId !== 'string') {
    throw unauthorized('Only Google sign-in is supported here');
  }
  if (!decoded.email || !decoded.email_verified) throw badRequest('Your Google account email is not verified');
  return { googleId, email: decoded.email.toLowerCase(), name: decoded.name?.trim(), picture: decoded.picture };
};

let verifier: Verifier = firebaseVerifier;
export const verifyGoogleIdToken = (idToken: string) => verifier(idToken);

/** Tests swap in a fake verifier; pass nothing to restore the real one. */
export const setGoogleVerifier = (fn?: Verifier) => {
  verifier = fn ?? firebaseVerifier;
};
