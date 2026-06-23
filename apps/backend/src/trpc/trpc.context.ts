import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

/** Per-request tRPC context. Extend with the authenticated user once auth lands. */
export interface TrpcContext {
  token: string | null;
}

export function createTrpcContext({ req }: CreateExpressContextOptions): TrpcContext {
  const auth = req.headers.authorization;
  return { token: auth?.startsWith('Bearer ') ? auth.slice(7) : null };
}
