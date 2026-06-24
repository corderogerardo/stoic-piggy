import { TRPCClientError } from '@trpc/client';

/**
 * True only for a genuine authentication failure (HTTP 401 / tRPC UNAUTHORIZED).
 * Used so a transient network/cold-start error never clobbers a valid token —
 * the difference between "your session expired" and "the server hiccuped".
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    const data = error.data as { httpStatus?: number; code?: string } | null | undefined;
    return data?.httpStatus === 401 || data?.code === 'UNAUTHORIZED';
  }
  return false;
}
