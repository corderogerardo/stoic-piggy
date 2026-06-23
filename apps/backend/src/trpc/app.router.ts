import {
  type Child,
  type CreateTransactionInput,
  createTransactionSchema,
  type DashboardChild,
  type PiggyBank,
  type Quest,
  type QuestStatus,
  type SavingsGoal,
  type Transaction,
  type TransactionType,
} from '@stoicpiggy/shared';
import { z } from 'zod';
import { publicProcedure, router } from './trpc';

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
}
export interface FamilyPort {
  listChildren(parentId: string): Promise<ChildRow[]>;
  listGoals(childId: string): Promise<GoalRow[]>;
  listQuests(childId: string): Promise<QuestRow[]>;
  dashboardByParent(parentId: string): Promise<DashboardChildRow[]>;
}
export interface RouterServices {
  piggy: PiggyPort;
  family: FamilyPort;
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

export function createAppRouter({ piggy, family }: RouterServices) {
  return router({
    health: publicProcedure.query(() => ({
      status: 'ok' as const,
      service: 'backend' as const,
      timestamp: new Date().toISOString(),
    })),

    children: router({
      listByParent: publicProcedure
        .input(z.object({ parentId: z.string().min(1) }))
        .query(
          async ({ input }): Promise<Child[]> =>
            (await family.listChildren(input.parentId)).map(toChild),
        ),
      dashboardByParent: publicProcedure
        .input(z.object({ parentId: z.string().min(1) }))
        .query(
          async ({ input }): Promise<DashboardChild[]> =>
            (await family.dashboardByParent(input.parentId)).map(toDashboardChild),
        ),
    }),

    goals: router({
      listByChild: publicProcedure
        .input(childIdInput)
        .query(
          async ({ input }): Promise<SavingsGoal[]> =>
            (await family.listGoals(input.childId)).map(toGoal),
        ),
    }),

    quests: router({
      listByChild: publicProcedure
        .input(childIdInput)
        .query(
          async ({ input }): Promise<Quest[]> =>
            (await family.listQuests(input.childId)).map(toQuest),
        ),
    }),

    piggy: router({
      listByChild: publicProcedure
        .input(childIdInput)
        .query(
          async ({ input }): Promise<PiggyBank[]> =>
            (await piggy.listPiggyBanks(input.childId)).map(toPiggyBank),
        ),
      createTransaction: publicProcedure
        .input(createTransactionSchema)
        .mutation(
          async ({ input }): Promise<Transaction> =>
            toTransaction(await piggy.createTransaction(input)),
        ),
    }),
  });
}

/** The contract shared (type-only) with every client via `@stoicpiggy/api`. */
export type AppRouter = ReturnType<typeof createAppRouter>;
