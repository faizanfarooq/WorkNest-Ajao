import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { LoginInput, RegisterInput } from '@shared/schemas';
import { api, refreshSession, setAccessToken, setSessionLostHandler } from './api';
import type { SessionUser } from './types';

interface Session {
  accessToken: string;
  user: SessionUser;
}

interface AuthState {
  user: SessionUser | null;
  ready: boolean;
  login: (input: LoginInput) => Promise<SessionUser>;
  register: (input: RegisterInput) => Promise<SessionUser>;
  logout: () => Promise<void>;
  /** Re-reads the user (e.g. after renaming yourself or your company). */
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  const adopt = useCallback((s: Session) => {
    setAccessToken(s.accessToken);
    setUser(s.user);
    return s.user;
  }, []);

  useEffect(() => {
    setSessionLostHandler(() => {
      setAccessToken(null);
      setUser(null);
    });
    // Restore a session from the refresh cookie on first load.
    refreshSession().then((s: Session | null) => {
      if (s) setUser(s.user);
      setReady(true);
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      ready,
      login: async (input) => {
        queryClient.clear();
        return adopt(await api<Session>('/auth/login', { method: 'POST', body: input }));
      },
      register: async (input) => {
        queryClient.clear();
        return adopt(await api<Session>('/auth/register', { method: 'POST', body: input }));
      },
      logout: async () => {
        await api('/auth/logout', { method: 'POST' }).catch(() => {});
        setAccessToken(null);
        setUser(null);
        queryClient.clear();
      },
      reload: async () => {
        const { user } = await api<{ user: SessionUser }>('/auth/me');
        setUser(user);
      },
    }),
    [user, ready, adopt, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
