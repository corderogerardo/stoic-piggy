'use client';

import { ApiProvider } from '@stoicpiggy/api';
import type { ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/trpc';

export function Providers({ children }: { children: ReactNode }) {
  return <ApiProvider url={API_URL}>{children}</ApiProvider>;
}
