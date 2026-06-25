import {
  type ActivityEvent,
  type ActivityKind,
  type AuthSession,
  type AuthUser,
  type Child,
  type ChildHome,
  type ChildPatterns,
  type ChildWins,
  type CreateChildAccountInput,
  type CreateTaskInput,
  type CreateTransactionInput,
  createChildAccountSchema,
  createTaskSchema,
  createTransactionSchema,
  type DashboardChild,
  deleteChildSchema,
  type LoginChildInput,
  type LoginParentInput,
  loginChildSchema,
  loginParentSchema,
  type ParentSettings,
  type ParentSummary,
  type PiggyBank,
  type Quest,
  type QuestStatus,
  questIdSchema,
  type RegisterParentInput,
  type ReportsData,
  type RequestPasswordResetInput,
  type ResetChildPasswordInput,
  type ResetPasswordInput,
  type ResistImpulseInput,
  registerParentSchema,
  requestPasswordResetSchema,
  resetChildPasswordSchema,
  resetPasswordSchema,
  resistImpulseSchema,
  type SavingsGoal,
  type SetChildActiveInput,
  type SubmitTaskInput,
  setChildActiveSchema,
  submitTaskSchema,
  type Task,
  type TaskCategory,
  type TaskPayType,
  type TaskRecurrence,
  type TaskStatus,
  type Transaction,
  type TransactionType,
  taskIdSchema,
  type UpdateAllowanceInput,
  type UpdateChildInput,
  type UpdateParentSettingsInput,
  updateAllowanceSchema,
  updateChildSchema,
  updateParentSettingsSchema,
  type VerifyEmailInput,
  verifyEmailSchema,
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
interface TaskRow {
  id: string;
  childId: string;
  title: string;
  category: TaskCategory;
  payType: TaskPayType;
  amountCents: number;
  rewardXp: number;
  recurrence: TaskRecurrence;
  status: TaskStatus;
  note: string | null;
  submittedAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
interface ActivityEventRow {
  id: string;
  kind: ActivityKind;
  childId: string;
  title: string;
  amountCents: number | null;
  createdAt: Date;
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
  active: boolean;
  goal: { title: string; targetCents: number; savedCents: number } | null;
  resistedCount: number;
  tasksApproved: number;
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
  summaryByParent(parentId: string): Promise<ParentSummary>;
  activityByParent(parentId: string): Promise<ActivityEventRow[]>;
  reportsByParent(parentId: string): Promise<ReportsData>;
  parentSettings(parentId: string): Promise<ParentSettings>;
  updateParentSettings(parentId: string, input: UpdateParentSettingsInput): Promise<ParentSettings>;
  /** The owning parent's id for a child, or null if the child doesn't exist. */
  childParentId(childId: string): Promise<string | null>;
  updateChild(input: UpdateChildInput): Promise<ChildRow>;
  updateAllowance(input: UpdateAllowanceInput): Promise<ChildRow>;
  setChildActive(input: SetChildActiveInput): Promise<ChildRow>;
  deleteChild(childId: string): Promise<void>;
  childQuests(childId: string): Promise<QuestRow[]>;
  completeQuest(childId: string, questId: string): Promise<QuestRow>;
  childWins(childId: string): Promise<ChildWins>;
  resistImpulse(childId: string, input: ResistImpulseInput): Promise<ChildWins>;
  childPatterns(childId: string): Promise<ChildPatterns>;
}
export interface TaskPort {
  taskChildId(taskId: string): Promise<string | null>;
  createTask(input: CreateTaskInput): Promise<TaskRow>;
  listByParent(parentId: string): Promise<TaskRow[]>;
  pendingApprovals(parentId: string): Promise<TaskRow[]>;
  listByChild(childId: string): Promise<TaskRow[]>;
  submitTask(input: SubmitTaskInput): Promise<TaskRow>;
  approveTask(taskId: string): Promise<TaskRow>;
  rejectTask(taskId: string): Promise<TaskRow>;
  deleteTask(taskId: string): Promise<void>;
}
export interface AuthPort {
  registerParent(input: RegisterParentInput): Promise<AuthSession>;
  loginParent(input: LoginParentInput): Promise<AuthSession>;
  loginChild(input: LoginChildInput): Promise<AuthSession>;
  verifyEmail(input: VerifyEmailInput): Promise<AuthSession>;
  resendVerification(parentId: string): Promise<{ ok: true }>;
  requestPasswordReset(input: RequestPasswordResetInput): Promise<{ ok: true }>;
  resetPassword(input: ResetPasswordInput): Promise<{ ok: true }>;
  me(claims: AuthClaims): Promise<AuthUser>;
  createChild(parentId: string, input: CreateChildAccountInput): Promise<ChildRow>;
  resetChildPassword(input: ResetChildPasswordInput): Promise<{ ok: true }>;
  childHome(childId: string): Promise<ChildHome>;
}
export interface RouterServices {
  piggy: PiggyPort;
  family: FamilyPort;
  auth: AuthPort;
  task: TaskPort;
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
const toTask = (r: TaskRow): Task => ({
  id: r.id,
  childId: r.childId,
  title: r.title,
  category: r.category,
  payType: r.payType,
  amountCents: r.amountCents,
  rewardXp: r.rewardXp,
  recurrence: r.recurrence,
  status: r.status,
  note: r.note ?? undefined,
  submittedAt: r.submittedAt ? iso(r.submittedAt) : undefined,
  resolvedAt: r.resolvedAt ? iso(r.resolvedAt) : undefined,
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
  active: r.active,
  goal: r.goal ?? undefined,
  resistedCount: r.resistedCount,
  tasksApproved: r.tasksApproved,
});

const toActivityEvent = (r: ActivityEventRow): ActivityEvent => ({
  id: r.id,
  kind: r.kind,
  childId: r.childId,
  title: r.title,
  amountCents: r.amountCents ?? undefined,
  createdAt: iso(r.createdAt),
});

const childIdInput = z.object({ childId: z.string().min(1) });

export function createAppRouter({ piggy, family, auth, task }: RouterServices) {
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

  /** Authorize access to a task by resolving its owning child, then reusing the child check. */
  async function authorizeTaskAccess(user: AuthClaims, taskId: string): Promise<void> {
    const childId = await task.taskChildId(taskId);
    if (!childId) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found.' });
    }
    await authorizeChildAccess(user, childId);
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
      // Redeem the link from the verification email; signs the parent in verified.
      verifyEmail: publicProcedure
        .input(verifyEmailSchema)
        .mutation(({ input }): Promise<AuthSession> => auth.verifyEmail(input)),
      // Re-send the verification email to the signed-in parent (throttled).
      resendVerification: parentProcedure.mutation(
        ({ ctx }): Promise<{ ok: true }> => auth.resendVerification(ctx.user.sub),
      ),
      // Start a password reset (always resolves OK — no account enumeration).
      requestPasswordReset: publicProcedure
        .input(requestPasswordResetSchema)
        .mutation(({ input }): Promise<{ ok: true }> => auth.requestPasswordReset(input)),
      // Finish a password reset with the token from the email + a new password.
      resetPassword: publicProcedure
        .input(resetPasswordSchema)
        .mutation(({ input }): Promise<{ ok: true }> => auth.resetPassword(input)),
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
      // Headline numbers for the overview (counts, total saved, paid this month).
      summary: parentProcedure.query(
        ({ ctx }): Promise<ParentSummary> => family.summaryByParent(ctx.user.sub),
      ),
      // Recent-events feed derived from the parent's tasks + transactions.
      activity: parentProcedure.query(
        async ({ ctx }): Promise<ActivityEvent[]> =>
          (await family.activityByParent(ctx.user.sub)).map(toActivityEvent),
      ),
      // Aggregates for the Reports page.
      reports: parentProcedure.query(
        ({ ctx }): Promise<ReportsData> => family.reportsByParent(ctx.user.sub),
      ),
      // A parent creates a kid's login account (+ a starter piggy bank).
      create: parentProcedure
        .input(createChildAccountSchema)
        .mutation(
          async ({ ctx, input }): Promise<Child> =>
            toChild(await auth.createChild(ctx.user.sub, input)),
        ),
      // Edit a kid's profile (name / age). Ownership enforced before the write.
      update: parentProcedure
        .input(updateChildSchema)
        .mutation(async ({ ctx, input }): Promise<Child> => {
          await authorizeChildAccess(ctx.user, input.childId);
          return toChild(await family.updateChild(input));
        }),
      // Set a kid's allowance amount + autopay flag.
      updateAllowance: parentProcedure
        .input(updateAllowanceSchema)
        .mutation(async ({ ctx, input }): Promise<Child> => {
          await authorizeChildAccess(ctx.user, input.childId);
          return toChild(await family.updateAllowance(input));
        }),
      // Set a new password for a kid (kids forget passwords).
      resetPassword: parentProcedure
        .input(resetChildPasswordSchema)
        .mutation(async ({ ctx, input }): Promise<{ ok: true }> => {
          await authorizeChildAccess(ctx.user, input.childId);
          return auth.resetChildPassword(input);
        }),
      // Deactivate (block login) or reactivate a kid.
      setActive: parentProcedure
        .input(setChildActiveSchema)
        .mutation(async ({ ctx, input }): Promise<Child> => {
          await authorizeChildAccess(ctx.user, input.childId);
          return toChild(await family.setChildActive(input));
        }),
      // Permanently delete a kid (cascades their banks, goals, quests, tasks).
      delete: parentProcedure
        .input(deleteChildSchema)
        .mutation(async ({ ctx, input }): Promise<{ ok: true }> => {
          await authorizeChildAccess(ctx.user, input.childId);
          await family.deleteChild(input.childId);
          return { ok: true };
        }),
    }),

    parent: router({
      // The signed-in parent's preferences.
      settings: parentProcedure.query(
        ({ ctx }): Promise<ParentSettings> => family.parentSettings(ctx.user.sub),
      ),
      updateSettings: parentProcedure
        .input(updateParentSettingsSchema)
        .mutation(
          ({ ctx, input }): Promise<ParentSettings> =>
            family.updateParentSettings(ctx.user.sub, input),
        ),
    }),

    tasks: router({
      // A parent assigns a task to one of their kids.
      create: parentProcedure
        .input(createTaskSchema)
        .mutation(async ({ ctx, input }): Promise<Task> => {
          await authorizeChildAccess(ctx.user, input.childId);
          return toTask(await task.createTask(input));
        }),
      // All tasks across the signed-in parent's kids.
      listByParent: parentProcedure.query(
        async ({ ctx }): Promise<Task[]> => (await task.listByParent(ctx.user.sub)).map(toTask),
      ),
      // Submitted tasks awaiting the parent's approval.
      pendingApprovals: parentProcedure.query(
        async ({ ctx }): Promise<Task[]> => (await task.pendingApprovals(ctx.user.sub)).map(toTask),
      ),
      // A kid's own tasks (parent or owning kid).
      listByChild: protectedProcedure
        .input(childIdInput)
        .query(async ({ ctx, input }): Promise<Task[]> => {
          await authorizeChildAccess(ctx.user, input.childId);
          return (await task.listByChild(input.childId)).map(toTask);
        }),
      // A kid marks their task done → submitted.
      submit: childProcedure
        .input(submitTaskSchema)
        .mutation(async ({ ctx, input }): Promise<Task> => {
          await authorizeTaskAccess(ctx.user, input.taskId);
          return toTask(await task.submitTask(input));
        }),
      // A parent approves a submitted task (credits the kid + awards xp).
      approve: parentProcedure
        .input(taskIdSchema)
        .mutation(async ({ ctx, input }): Promise<Task> => {
          await authorizeTaskAccess(ctx.user, input.taskId);
          return toTask(await task.approveTask(input.taskId));
        }),
      // A parent sends a submitted task back to the kid.
      reject: parentProcedure
        .input(taskIdSchema)
        .mutation(async ({ ctx, input }): Promise<Task> => {
          await authorizeTaskAccess(ctx.user, input.taskId);
          return toTask(await task.rejectTask(input.taskId));
        }),
      // A parent deletes a task.
      delete: parentProcedure
        .input(taskIdSchema)
        .mutation(async ({ ctx, input }): Promise<{ ok: true }> => {
          await authorizeTaskAccess(ctx.user, input.taskId);
          await task.deleteTask(input.taskId);
          return { ok: true };
        }),
    }),

    // The signed-in kid's own data + self-service actions.
    me: router({
      home: childProcedure.query(({ ctx }): Promise<ChildHome> => auth.childHome(ctx.user.sub)),
      quests: childProcedure.query(
        async ({ ctx }): Promise<Quest[]> => (await family.childQuests(ctx.user.sub)).map(toQuest),
      ),
      completeQuest: childProcedure
        .input(questIdSchema)
        .mutation(
          async ({ ctx, input }): Promise<Quest> =>
            toQuest(await family.completeQuest(ctx.user.sub, input.questId)),
        ),
      wins: childProcedure.query(({ ctx }): Promise<ChildWins> => family.childWins(ctx.user.sub)),
      // Derived spending/patience signals the coach reads (plain aggregation, no AI).
      patterns: childProcedure.query(
        ({ ctx }): Promise<ChildPatterns> => family.childPatterns(ctx.user.sub),
      ),
      resistImpulse: childProcedure
        .input(resistImpulseSchema)
        .mutation(
          ({ ctx, input }): Promise<ChildWins> => family.resistImpulse(ctx.user.sub, input),
        ),
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
