import { useMutation, useQuery } from '@tanstack/react-query';
import { isAuthError } from './auth-error';
import { useTRPC } from './trpc';

/**
 * Ready-made, fully-typed hooks. They work identically on web (landing/dashboard)
 * and React Native (mobile) — they just wrap TanStack Query with the tRPC option
 * factories. Add new ones here as the router grows.
 */

export function useApiHealth() {
  const trpc = useTRPC();
  return useQuery(trpc.health.queryOptions());
}

// ---- Auth ----

/** Register a new parent. Returns an `AuthSession` ({ token, user }). */
export function useRegisterParent() {
  const trpc = useTRPC();
  return useMutation(trpc.auth.registerParent.mutationOptions());
}

/** Log a parent in by email + password. */
export function useLoginParent() {
  const trpc = useTRPC();
  return useMutation(trpc.auth.loginParent.mutationOptions());
}

/** Log a kid in by username + password. */
export function useLoginChild() {
  const trpc = useTRPC();
  return useMutation(trpc.auth.loginChild.mutationOptions());
}

/** Redeem an email-verification token. Returns a fresh (verified) `AuthSession`. */
export function useVerifyEmail() {
  const trpc = useTRPC();
  return useMutation(trpc.auth.verifyEmail.mutationOptions());
}

/** Re-send the verification email to the signed-in parent. */
export function useResendVerification() {
  const trpc = useTRPC();
  return useMutation(trpc.auth.resendVerification.mutationOptions());
}

/** Start a password reset by email. Always resolves OK (no account enumeration). */
export function useRequestPasswordReset() {
  const trpc = useTRPC();
  return useMutation(trpc.auth.requestPasswordReset.mutationOptions());
}

/** Complete a password reset with the token from the email + a new password. */
export function useResetPassword() {
  const trpc = useTRPC();
  return useMutation(trpc.auth.resetPassword.mutationOptions());
}

/** Resolve the currently signed-in user. Disable until a token is present. */
export function useMe(enabled = true) {
  const trpc = useTRPC();
  return useQuery(
    trpc.auth.me.queryOptions(undefined, {
      enabled,
      // Don't retry a real 401 (token is bad), but do retry transient errors
      // (e.g. a Render free-tier cold start) so a hiccup doesn't drop the session.
      retry: (count, error) => !isAuthError(error) && count < 3,
    }),
  );
}

// ---- Parent dashboard (token-scoped) ----

/** Aggregated per-child rows for the signed-in parent. */
export function useMyDashboard(enabled = true) {
  const trpc = useTRPC();
  return useQuery(trpc.children.dashboard.queryOptions(undefined, { enabled }));
}

/** The signed-in parent's children. */
export function useMyChildren(enabled = true) {
  const trpc = useTRPC();
  return useQuery(trpc.children.list.queryOptions(undefined, { enabled }));
}

/** Create a kid login account (+ starter piggy bank) for the signed-in parent. */
export function useCreateChild() {
  const trpc = useTRPC();
  return useMutation(trpc.children.create.mutationOptions());
}

// ---- Kid app (token-scoped) ----

/** The signed-in kid's home payload (balance + goal + quests). */
export function useChildHome(enabled = true) {
  const trpc = useTRPC();
  return useQuery(trpc.me.home.queryOptions(undefined, { enabled }));
}

// ---- Per-child reads (parent or owning kid) ----

export function usePiggyBanks(childId: string) {
  const trpc = useTRPC();
  return useQuery(
    trpc.piggy.listByChild.queryOptions({ childId }, { enabled: childId.length > 0 }),
  );
}

export function useSavingsGoals(childId: string) {
  const trpc = useTRPC();
  return useQuery(
    trpc.goals.listByChild.queryOptions({ childId }, { enabled: childId.length > 0 }),
  );
}

export function useQuests(childId: string) {
  const trpc = useTRPC();
  return useQuery(
    trpc.quests.listByChild.queryOptions({ childId }, { enabled: childId.length > 0 }),
  );
}

export function useCreateTransaction() {
  const trpc = useTRPC();
  return useMutation(trpc.piggy.createTransaction.mutationOptions());
}
