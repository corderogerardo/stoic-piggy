import type { AppRouter } from '@stoicpiggy/backend/trpc';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { createTRPCContext } from '@trpc/tanstack-react-query';

/**
 * Typed tRPC + TanStack Query context, shared by every client (landing,
 * dashboard, mobile). `useTRPC()` returns the option factories — e.g.
 * `useQuery(trpc.piggy.listByChild.queryOptions({ childId }))`.
 */
export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();

export type { AppRouter };
/** Inferred input types for every procedure, e.g. `RouterInputs['piggy']['createTransaction']`. */
export type RouterInputs = inferRouterInputs<AppRouter>;
/** Inferred output types for every procedure, e.g. `RouterOutputs['piggy']['listByChild']`. */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
