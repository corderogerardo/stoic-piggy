import {
  type AuthSession,
  type AuthUser,
  type Child,
  type ChildHome,
  type CreateChildAccountInput,
  type CreateTransactionInput,
  createChildAccountSchema,
  createTransactionSchema,
  type DashboardChild,
  type LoginChildInput,
  type LoginParentInput,
  loginChildSchema,
  loginParentSchema,
  type PiggyBank,
  type Quest,
  type QuestStatus,
  type RegisterParentInput,
  registerParentSchema,
  type SavingsGoal,
  type Transaction,
  type TransactionType,
} from '@stoicpiggy/shared';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { AuthClaims } from '../auth/jwt';
import {
  childProcedure,
  parentProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from './trpc';

// Prisma-free ports: the router depends only on these shapes (the Nest services
// satisfy them structurally), so the exported AppRouter type never references
// @prisma/client — clients only ever pull `@stoicpiggy/shared` types.
interface PiggyBankRow {
  id: string;
  childId: string;
  name: string;
  balanceCents: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
interface TransactionRow {
  id: string;
  piggyBankId: string;
  type: TransactionType;
  amountCents: number;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}
interface ChildRow {
  id: string;
  parentId: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  createdAt: Date;
  updatedAt: Date;
}
interface GoalRow {
  id: string;
  childId: string;
  title: string;
  targetCents: number;
  savedCents: number;
  achievedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
interface QuestRow {
  id: string;
  childId: string;
  title: string;
  description: string;
  rewardXp: number;
  rewardCents: number;
  status: QuestStatus;
  createdAt: Date;
  updatedAt: Date;
}
interface DashboardChildRow {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  age: number | null;
  level: number;
  xp: number;
  balanceCents: number;
  allowanceCents: number;
  autopayEnabled: boolean;
  goal: { title: string; targetCents: number; savedCents: number } | null;
}

export interface PiggyPort {
  listPiggyBanks(childId: string): Promise<PiggyBankRow[]>;
  createTransaction(input: CreateTransactionInput): Promise<TransactionRow>;
  /** The child that owns a piggy bank, or null if the bank doesn't exist. */
  piggyBankChildId(piggyBankId: string): Promise<string | null>;
}
export interface FamilyPort {
  listChildren(parentId: string): Promise<ChildRow[]>;
  listGoals(childId: string): Promise<GoalRow[]>;
  listQuests(childId: string): Promise<QuestRow[]>;
  dashboardByParent(parentId: string): Promise<DashboardChildRow[]>;
  /** The owning parent's id for a child, or null if the child doesn't exist. */
  childParentId(childId: string): Promise<string | null>;
}
export interface AuthPort {
  registerParent(input: RegisterParentInput): Promise<AuthSession>;
  loginParent(input: LoginParentInput): Promise<AuthSession>;
  loginChild(input: LoginChildInput): Promise<AuthSession>;
  me(claims: AuthClaims): Promise<AuthUser>;
  createChild(parentId: string, input: CreateChildAccountInput): Promise<ChildRow>;
  childHome(childId: string): Promise<ChildHome>;
}
export interface RouterServices {
  piggy: PiggyPort;
  family: FamilyPort;
  auth: AuthPort;
}

const iso = (d: Date) => d.toISOString();

const toPiggyBank = (r: PiggyBankRow): PiggyBank => ({
  id: r.id,
  childId: r.childId,
  name: r.name,
  balanceCents: r.balanceCents,
  currency: r.currency,
  createdAt: iso(r.createdAt),
  updatedAt: iso(r.updatedAt),
});
const toTransaction = (r: TransactionRow): Transaction => ({
  id: r.id,
  piggyBankId: r.piggyBankId,
  type: r.type,
  amountCents: r.amountCents,
  note: r.note ?? undefined,
  createdAt: iso(r.createdAt),
  updatedAt: iso(r.updatedAt),
});
const toChild = (r: ChildRow): Child => ({
  id: r.id,
  parentId: r.parentId,
  displayName: r.displayName,
  avatarUrl: r.avatarUrl ?? undefined,
  level: r.level,
  xp: r.xp,
  createdAt: iso(r.createdAt),
  updatedAt: iso(r.updatedAt),
});
const toGoal = (r: GoalRow): SavingsGoal => ({
  id: r.id,
  childId: r.childId,
  title: r.title,
  targetCents: r.targetCents,
  savedCents: r.savedCents,
  achievedAt: r.achievedAt ? iso(r.achievedAt) : undefined,
  createdAt: iso(r.createdAt),
  updatedAt: iso(r.updatedAt),
});
const toQuest = (r: QuestRow): Quest => ({
  id: r.id,
  childId: r.childId,
  title: r.title,
  description: r.description,
  rewardXp: r.rewardXp,
  rewardCents: r.rewardCents,
  status: r.status,
  createdAt: iso(r.createdAt),
  updatedAt: iso(r.updatedAt),
});
const toDashboardChild = (r: DashboardChildRow): DashboardChild => ({
  id: r.id,
  displayName: r.displayName,
  avatarUrl: r.avatarUrl ?? undefined,
  age: r.age ?? undefined,
  level: r.level,
  xp: r.xp,
  balanceCents: r.balanceCents,
  allowanceCents: r.allowanceCents,
  autopayEnabled: r.autopayEnabled,
  goal: r.goal ?? undefined,
});

const childIdInput = z.object({ childId: z.string().min(1) });

export function createAppRouter({ piggy, family, auth }: RouterServices) {
  /**
   * Authorize access to a specific child's data: a kid may only touch their own,
   * a parent only their own children. Throws FORBIDDEN otherwise.
   */
  async function authorizeChildAccess(user: AuthClaims, childId: string): Promise<void> {
    if (user.role === 'child') {
      if (user.sub !== childId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your account.' });
      }
      return;
    }
    const parentId = await family.childParentId(childId);
    if (parentId !== user.sub) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your child.' });
    }
  }

  return router({
    health: publicProcedure.query(() => ({
      status: 'ok' as const,
      service: 'backend' as const,
      timestamp: new Date().toISOString(),
    })),

    auth: router({
      registerParent: publicProcedure
        .input(registerParentSchema)
        .mutation(({ input }): Promise<AuthSession> => auth.registerParent(input)),
      loginParent: publicProcedure
        .input(loginParentSchema)
        .mutation(({ input }): Promise<AuthSession> => auth.loginParent(input)),
      loginChild: publicProcedure
        .input(loginChildSchema)
        .mutation(({ input }): Promise<AuthSession> => auth.loginChild(input)),
      me: protectedProcedure.query(({ ctx }): Promise<AuthUser> => auth.me(ctx.user)),
    }),

    children: router({
      // Aggregated per-child rows for the signed-in parent's dashboard.
      dashboard: parentProcedure.query(
        async ({ ctx }): Promise<DashboardChild[]> =>
          (await family.dashboardByParent(ctx.user.sub)).map(toDashboardChild),
      ),
      list: parentProcedure.query(
        async ({ ctx }): Promise<Child[]> => (await family.listChildren(ctx.user.sub)).map(toChild),
      ),
      // A parent creates a kid's login account (+ a starter piggy bank).
      create: parentProcedure
        .input(createChildAccountSchema)
        .mutation(
          async ({ ctx, input }): Promise<Child> =>
            toChild(await auth.createChild(ctx.user.sub, input)),
        ),
    }),

    // The signed-in kid's own home payload.
    me: router({
      home: childProcedure.query(({ ctx }): Promise<ChildHome> => auth.childHome(ctx.user.sub)),
    }),

    goals: router({
      listByChild: protectedProcedure
        .input(childIdInput)
        .query(async ({ ctx, input }): Promise<SavingsGoal[]> => {
          await authorizeChildAccess(ctx.user, input.childId);
          return (await family.listGoals(input.childId)).map(toGoal);
        }),
    }),

    quests: router({
      listByChild: protectedProcedure
        .input(childIdInput)
        .query(async ({ ctx, input }): Promise<Quest[]> => {
          await authorizeChildAccess(ctx.user, input.childId);
          return (await family.listQuests(input.childId)).map(toQuest);
        }),
    }),

    piggy: router({
      listByChild: protectedProcedure
        .input(childIdInput)
        .query(async ({ ctx, input }): Promise<PiggyBank[]> => {
          await authorizeChildAccess(ctx.user, input.childId);
          return (await piggy.listPiggyBanks(input.childId)).map(toPiggyBank);
        }),
      createTransaction: protectedProcedure
        .input(createTransactionSchema)
        .mutation(async ({ ctx, input }): Promise<Transaction> => {
          // Authorize against the bank's owning child — never trust the client.
          const ownerChildId = await piggy.piggyBankChildId(input.piggyBankId);
          if (!ownerChildId) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Piggy bank not found.' });
          }
          await authorizeChildAccess(ctx.user, ownerChildId);
          return toTransaction(await piggy.createTransaction(input));
        }),
    }),
  });
}

/** The contract shared (type-only) with every client via `@stoicpiggy/api`. */
export type AppRouter = ReturnType<typeof createAppRouter>;
