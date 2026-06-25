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

// The backend runs on Render's free tier, which spins down after ~15 min idle
// and cold-starts in ~30-60s. During that window the edge either holds the
// request open or returns a 502/503/504. Without this, the first request after
// idle (a launch, a login) just fails — and the app looks broken/"mocked".
const COLD_START_DEADLINE_MS = 90_000;
const PER_ATTEMPT_TIMEOUT_MS = 75_000;
const RETRY_DELAY_MS = 1_500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * A `fetch` that rides out a cold start: one attempt waits up to ~75s (a hung
 * wake-up request usually answers within that), and a gateway error (502/503/504)
 * is retried until a 90s deadline. A real error response (e.g. 401 wrong
 * password) is returned immediately — only gateway errors are retried, and a
 * caller-cancelled request (React Query unmount) propagates without retry.
 */
async function coldStartFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const start = Date.now();
  while (true) {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    if (init?.signal?.aborted) controller.abort();
    else init?.signal?.addEventListener('abort', onAbort, { once: true });
    const timer = setTimeout(() => controller.abort(), PER_ATTEMPT_TIMEOUT_MS);
    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      const wakingUp = res.status === 502 || res.status === 503 || res.status === 504;
      if (wakingUp && !init?.signal?.aborted && Date.now() - start < COLD_START_DEADLINE_MS) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      return res;
    } finally {
      clearTimeout(timer);
      init?.signal?.removeEventListener('abort', onAbort);
    }
  }
}

export function createTrpcClient(opts: CreateClientOptions): TRPCClient<AppRouter> {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: opts.url,
        transformer: superjson,
        fetch: coldStartFetch,
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
