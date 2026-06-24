import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { TrpcContext } from './trpc.context';

const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

/** Requires any authenticated user; narrows `ctx.user` to non-null downstream. */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Sign in to continue.' });
  }
  return next({ ctx: { user: ctx.user } });
});

/** Requires a parent token. */
export const parentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'parent') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Parents only.' });
  }
  return next({ ctx: { user: ctx.user } });
});

/** Requires a child token. */
export const childProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'child') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Kids only.' });
  }
  return next({ ctx: { user: ctx.user } });
});
