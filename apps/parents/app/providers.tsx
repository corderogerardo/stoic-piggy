'use client';

import { ApiProvider } from '@stoicpiggy/api';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { getToken } from '@/lib/token-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/trpc';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApiProvider url={API_URL} getToken={getToken}>
      <AuthProvider>{children}</AuthProvider>
    </ApiProvider>
  );
}
