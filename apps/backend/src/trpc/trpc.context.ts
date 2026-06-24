import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { AuthClaims } from '../auth/jwt';

/** Per-request tRPC context: the raw bearer token plus the verified user (if any). */
export interface TrpcContext {
  token: string | null;
  user: AuthClaims | null;
}

/** A token verifier — `AuthService.verify`, injected so the context stays Nest-free. */
export type TokenVerifier = (token: string) => AuthClaims | null;

/**
 * Build the per-request context factory. The verifier turns the `Authorization:
 * Bearer <token>` header into `ctx.user`, which the protected procedures read.
 */
export function makeCreateContext(verify: TokenVerifier) {
  return function createTrpcContext({ req }: CreateExpressContextOptions): TrpcContext {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    return { token, user: token ? verify(token) : null };
  };
}
