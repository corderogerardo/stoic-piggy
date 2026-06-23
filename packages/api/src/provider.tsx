import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { type CreateClientOptions, createTrpcClient, makeQueryClient } from './client';
import { TRPCProvider } from './trpc';

// On the server (SSR) always make a fresh QueryClient; in the browser / on a
// device reuse a singleton so React Suspense during first render doesn't recreate it.
let browserQueryClient: QueryClient | undefined;
function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export interface ApiProviderProps extends CreateClientOptions {
  children: ReactNode;
}

/** Drop-in provider for any app: `<ApiProvider url="…/trpc">{children}</ApiProvider>`. */
export function ApiProvider({ url, getToken, children }: ApiProviderProps) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() => createTrpcClient({ url, getToken }));

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
