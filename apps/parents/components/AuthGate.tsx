'use client';

import { Piggy } from '@stoicpiggy/ui';
import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { AuthScreen } from './AuthScreen';

/** Renders the app only for an authenticated parent; otherwise the login gate. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3 text-navy/60">
          <Piggy mood="zen" size={56} />
          <span className="text-sm font-extrabold">Cargando…</span>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') return <AuthScreen />;

  return <>{children}</>;
}
