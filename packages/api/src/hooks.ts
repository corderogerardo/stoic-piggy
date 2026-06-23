import { useMutation, useQuery } from '@tanstack/react-query';
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

export function useChildren(parentId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.children.listByParent.queryOptions({ parentId }, { enabled: parentId.length > 0 }));
}

/** Aggregated per-child dashboard rows (balance + goal) for a parent. */
export function useDashboardChildren(parentId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.children.dashboardByParent.queryOptions({ parentId }, { enabled: parentId.length > 0 }));
}

export function usePiggyBanks(childId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.piggy.listByChild.queryOptions({ childId }, { enabled: childId.length > 0 }));
}

export function useSavingsGoals(childId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.goals.listByChild.queryOptions({ childId }, { enabled: childId.length > 0 }));
}

export function useQuests(childId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.quests.listByChild.queryOptions({ childId }, { enabled: childId.length > 0 }));
}

export function useCreateTransaction() {
  const trpc = useTRPC();
  return useMutation(trpc.piggy.createTransaction.mutationOptions());
}
