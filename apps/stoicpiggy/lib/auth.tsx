import { isAuthError, useLoginChild, useMe } from '@stoicpiggy/api';
import type { AuthChild } from '@stoicpiggy/shared';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { loadToken, setToken } from './token-store';

type Status = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  status: Status;
  child: AuthChild | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [child, setChild] = useState<AuthChild | null>(null);

  const loginMutation = useLoginChild();
  const me = useMe(hydrated && hasToken);

  // Restore the persisted token on launch.
  useEffect(() => {
    let active = true;
    loadToken().then((tok) => {
      if (!active) return;
      setHasToken(tok !== null);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hasToken) {
      setChild(null);
      return;
    }
    if (me.data) {
      setChild(me.data.role === 'child' ? me.data : null);
    } else if (me.isError && isAuthError(me.error)) {
      // Only a real 401 signs the kid out — a transient error keeps the token.
      void setToken(null);
      setHasToken(false);
      setChild(null);
    }
  }, [hasToken, me.data, me.isError, me.error]);

  const status: Status = !hydrated
    ? 'loading'
    : !hasToken
      ? 'anonymous'
      : child
        ? 'authenticated'
        : me.isError && isAuthError(me.error)
          ? 'anonymous'
          : me.isError
            ? // Transient failure (e.g. backend cold start): keep the kid signed
              // in and let the home query retry in the background.
              'authenticated'
            : 'loading';

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      child,
      async login(username, password) {
        const session = await loginMutation.mutateAsync({ username, password });
        await setToken(session.token);
        if (session.user.role === 'child') setChild(session.user);
        setHasToken(true);
      },
      async logout() {
        await setToken(null);
        setHasToken(false);
        setChild(null);
        queryClient.clear();
      },
    }),
    [status, child, loginMutation, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
