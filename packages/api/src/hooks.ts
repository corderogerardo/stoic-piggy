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

/** Headline overview numbers (to-approve, active, saved, paid this month). */
export function useParentSummary(enabled = true) {
  const trpc = useTRPC();
  return useQuery(trpc.children.summary.queryOptions(undefined, { enabled }));
}

/** Recent activity feed (tasks + transactions) for the signed-in parent. */
export function useActivity(enabled = true) {
  const trpc = useTRPC();
  return useQuery(trpc.children.activity.queryOptions(undefined, { enabled }));
}

/** Aggregates for the Reports page. */
export function useReports(enabled = true) {
  const trpc = useTRPC();
  return useQuery(trpc.children.reports.queryOptions(undefined, { enabled }));
}

/** The signed-in parent's preferences. */
export function useParentSettings(enabled = true) {
  const trpc = useTRPC();
  return useQuery(trpc.parent.settings.queryOptions(undefined, { enabled }));
}

/** Update the signed-in parent's preferences (any subset). */
export function useUpdateParentSettings() {
  const trpc = useTRPC();
  return useMutation(trpc.parent.updateSettings.mutationOptions());
}

/** Create a kid login account (+ starter piggy bank) for the signed-in parent. */
export function useCreateChild() {
  const trpc = useTRPC();
  return useMutation(trpc.children.create.mutationOptions());
}

/** Edit a kid's profile (display name / age). */
export function useUpdateChild() {
  const trpc = useTRPC();
  return useMutation(trpc.children.update.mutationOptions());
}

/** Set a kid's allowance amount + autopay flag. */
export function useUpdateAllowance() {
  const trpc = useTRPC();
  return useMutation(trpc.children.updateAllowance.mutationOptions());
}

/** Set a new password for one of the parent's kids. */
export function useResetKidPassword() {
  const trpc = useTRPC();
  return useMutation(trpc.children.resetPassword.mutationOptions());
}

/** Deactivate (block login) or reactivate a kid. */
export function useSetChildActive() {
  const trpc = useTRPC();
  return useMutation(trpc.children.setActive.mutationOptions());
}

/** Permanently delete a kid (cascades their data). */
export function useDeleteChild() {
  const trpc = useTRPC();
  return useMutation(trpc.children.delete.mutationOptions());
}

// ---- Tasks (parent-assigned chores/lessons with an approval loop) ----

/** All tasks across the signed-in parent's kids. */
export function useTasks(enabled = true) {
  const trpc = useTRPC();
  return useQuery(trpc.tasks.listByParent.queryOptions(undefined, { enabled }));
}

/** Submitted tasks awaiting the parent's approval. */
export function usePendingApprovals(enabled = true) {
  const trpc = useTRPC();
  return useQuery(trpc.tasks.pendingApprovals.queryOptions(undefined, { enabled }));
}

/** A kid's tasks (parent or owning kid). */
export function useChildTasks(childId: string) {
  const trpc = useTRPC();
  return useQuery(
    trpc.tasks.listByChild.queryOptions({ childId }, { enabled: childId.length > 0 }),
  );
}

/** A parent assigns a task to a kid. */
export function useCreateTask() {
  const trpc = useTRPC();
  return useMutation(trpc.tasks.create.mutationOptions());
}

/** A kid marks a task done (→ submitted). */
export function useSubmitTask() {
  const trpc = useTRPC();
  return useMutation(trpc.tasks.submit.mutationOptions());
}

/** A parent approves a submitted task (credits the kid + awards xp). */
export function useApproveTask() {
  const trpc = useTRPC();
  return useMutation(trpc.tasks.approve.mutationOptions());
}

/** A parent sends a submitted task back to the kid. */
export function useRejectTask() {
  const trpc = useTRPC();
  return useMutation(trpc.tasks.reject.mutationOptions());
}

/** A parent deletes a task. */
export function useDeleteTask() {
  const trpc = useTRPC();
  return useMutation(trpc.tasks.delete.mutationOptions());
}

// ---- Kid app (token-scoped) ----

/** The signed-in kid's home payload (balance + goal + quests). */
export function useChildHome(enabled = true) {
  const trpc = useTRPC();
  return useQuery(trpc.me.home.queryOptions(undefined, { enabled }));
}

/** The signed-in kid's quests. */
export function useMyQuests(enabled = true) {
  const trpc = useTRPC();
  return useQuery(trpc.me.quests.queryOptions(undefined, { enabled }));
}

/** Complete a quest (claim its reward). */
export function useCompleteQuest() {
  const trpc = useTRPC();
  return useMutation(trpc.me.completeQuest.mutationOptions());
}

/** The signed-in kid's Wins stats (resisted impulses + progress). */
export function useMyWins(enabled = true) {
  const trpc = useTRPC();
  return useQuery(trpc.me.wins.queryOptions(undefined, { enabled }));
}

/** Log a resisted impulse (the Temptation flow). */
export function useResistImpulse() {
  const trpc = useTRPC();
  return useMutation(trpc.me.resistImpulse.mutationOptions());
}

/** The signed-in kid's derived spending/patience signals (for the coach). */
export function useMyPatterns(enabled = true) {
  const trpc = useTRPC();
  return useQuery(trpc.me.patterns.queryOptions(undefined, { enabled }));
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

/** A kid creates one of their own goals (server enforces the 3-goal cap). */
export function useCreateGoal() {
  const trpc = useTRPC();
  return useMutation(trpc.goals.create.mutationOptions());
}

/** A kid deletes one of their own goals. */
export function useDeleteGoal() {
  const trpc = useTRPC();
  return useMutation(trpc.goals.delete.mutationOptions());
}

/** A kid logs progress toward a goal (tracker — no real money moves). */
export function useContributeGoal() {
  const trpc = useTRPC();
  return useMutation(trpc.goals.contribute.mutationOptions());
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
