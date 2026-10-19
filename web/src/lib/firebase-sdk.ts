// Split out so the Firebase SDK is only downloaded when someone uses Google sign-in.
import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, inMemoryPersistence, setPersistence, signInWithPopup, signOut } from 'firebase/auth';
import { firebaseConfig } from './firebase';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// WorkNest's own session (refresh cookie) is what keeps people signed in, so Firebase keeps nothing on disk.
const ready = setPersistence(auth, inMemoryPersistence);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export async function signInAndGetToken() {
  await ready;
  const { user } = await signInWithPopup(auth, provider);
  try {
    return await user.getIdToken();
  } finally {
    // The token is handed to the server once; nothing else needs the Firebase session.
    await signOut(auth).catch(() => {});
  }
}
