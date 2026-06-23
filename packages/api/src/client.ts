import type { AppRouter } from '@stoicpiggy/backend/trpc';
import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink, type TRPCClient } from '@trpc/client';
import superjson from 'superjson';

export interface CreateClientOptions {
  /** Base tRPC endpoint, e.g. `http://localhost:3001/trpc`. */
  url: string;
  /** Optional async auth-token getter; attached as a Bearer header. */
  getToken?: () => string | null | Promise<string | null>;
}

export function createTrpcClient(opts: CreateClientOptions): TRPCClient<AppRouter> {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: opts.url,
        transformer: superjson,
        async headers() {
          const token = opts.getToken ? await opts.getToken() : null;
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  });
}
