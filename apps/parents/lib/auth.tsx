'use client';

import { isAuthError, useLoginParent, useMe, useRegisterParent } from '@stoicpiggy/api';
import type { AuthParent } from '@stoicpiggy/shared';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, setToken } from './token-store';

type Status = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  status: Status;
  parent: AuthParent | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // Start deterministically false on both server and client to avoid a hydration
  // mismatch; read the persisted token only after mount (`hydrated`).
  const [hydrated, setHydrated] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [parent, setParent] = useState<AuthParent | null>(null);

  const loginMutation = useLoginParent();
  const registerMutation = useRegisterParent();
  const me = useMe(hydrated && hasToken);

  useEffect(() => {
    setHasToken(getToken() !== null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasToken) {
      setParent(null);
      return;
    }
    if (me.data) {
      // The dashboard is parents-only; ignore a stray child token.
      setParent(me.data.role === 'parent' ? me.data : null);
    } else if (me.isError && isAuthError(me.error)) {
      // Only a real 401 drops the session — transient errors keep the token.
      setToken(null);
      setHasToken(false);
      setParent(null);
    }
  }, [hasToken, me.data, me.isError, me.error]);

  const status: Status = !hydrated
    ? 'loading'
    : !hasToken
      ? 'anonymous'
      : parent
        ? 'authenticated'
        : me.isError && isAuthError(me.error)
          ? 'anonymous'
          : me.isError
            ? // Transient failure (e.g. backend cold start): keep the session and
              // let the app render degraded; queries retry in the background.
              'authenticated'
            : 'loading';

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      parent,
      async login(email, password) {
        const session = await loginMutation.mutateAsync({ email, password });
        setToken(session.token);
        if (session.user.role === 'parent') setParent(session.user);
        setHasToken(true);
      },
      async register(email, password, displayName) {
        const session = await registerMutation.mutateAsync({ email, password, displayName });
        setToken(session.token);
        if (session.user.role === 'parent') setParent(session.user);
        setHasToken(true);
      },
      logout() {
        setToken(null);
        setHasToken(false);
        setParent(null);
        queryClient.clear();
      },
    }),
    [status, parent, loginMutation, registerMutation, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
