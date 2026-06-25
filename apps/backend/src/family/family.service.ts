import { Injectable } from '@nestjs/common';
import type {
  PayoutMethod,
  ResistImpulseInput,
  SetChildActiveInput,
  UpdateAllowanceInput,
  UpdateChildInput,
  UpdateParentSettingsInput,
} from '@stoicpiggy/shared';
import { TRPCError } from '@trpc/server';
import { PrismaService } from '../prisma/prisma.service';

const SETTINGS_SELECT = {
  notifyEnabled: true,
  weeklyReportEnabled: true,
  autoApproveTasks: true,
  payoutMethod: true,
} as const;

@Injectable()
export class FamilyService {
  constructor(private readonly prisma: PrismaService) {}

  /** The signed-in parent's preferences (Settings page). */
  async parentSettings(parentId: string) {
    const p = await this.prisma.parent.findUnique({
      where: { id: parentId },
      select: SETTINGS_SELECT,
    });
    return {
      notifyEnabled: p?.notifyEnabled ?? true,
      weeklyReportEnabled: p?.weeklyReportEnabled ?? true,
      autoApproveTasks: p?.autoApproveTasks ?? false,
      payoutMethod: (p?.payoutMethod ?? 'card') as PayoutMethod,
    };
  }

  /** Update any subset of the parent's preferences. */
  async updateParentSettings(parentId: string, input: UpdateParentSettingsInput) {
    const p = await this.prisma.parent.update({
      where: { id: parentId },
      data: {
        notifyEnabled: input.notifyEnabled,
        weeklyReportEnabled: input.weeklyReportEnabled,
        autoApproveTasks: input.autoApproveTasks,
        payoutMethod: input.payoutMethod,
      },
      select: SETTINGS_SELECT,
    });
    return { ...p, payoutMethod: p.payoutMethod as PayoutMethod };
  }

  /** Aggregates for the Reports page: per-day completed tasks + headline totals. */
  async reportsByParent(parentId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(dayStart.getTime() - 6 * 86_400_000);
    const [approved, paidAgg, kids] = await Promise.all([
      this.prisma.task.findMany({
        where: { child: { parentId }, status: 'approved', resolvedAt: { gte: weekStart } },
        select: { resolvedAt: true },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amountCents: true },
        where: {
          piggyBank: { child: { parentId } },
          type: { in: ['reward', 'allowance'] },
          createdAt: { gte: monthStart },
        },
      }),
      this.prisma.child.findMany({
        where: { parentId, deactivatedAt: null },
        select: { piggyBanks: { select: { balanceCents: true } } },
      }),
    ]);
    const tasksByDay = Array.from({ length: 7 }, () => 0);
    for (const t of approved) {
      if (!t.resolvedAt) continue;
      const idx = Math.floor((t.resolvedAt.getTime() - weekStart.getTime()) / 86_400_000);
      if (idx >= 0 && idx < 7) tasksByDay[idx] = (tasksByDay[idx] ?? 0) + 1;
    }
    const savedCents = kids.reduce(
      (s, k) => s + k.piggyBanks.reduce((a, b) => a + b.balanceCents, 0),
      0,
    );
    return {
      tasksByDay,
      tasksCompletedThisWeek: approved.length,
      paidThisMonthCents: paidAgg._sum.amountCents ?? 0,
      savedCents,
      activeKids: kids.length,
    };
  }

  async listChildren(parentId: string) {
    return this.prisma.child.findMany({ where: { parentId }, orderBy: { createdAt: 'asc' } });
  }

  // ---- Kid self-service (called from the `me` router, scoped to ctx.user.sub) ----

  /** The signed-in kid's quests. */
  async childQuests(childId: string) {
    return this.prisma.quest.findMany({ where: { childId }, orderBy: { createdAt: 'asc' } });
  }

  /** A kid completes a quest: mark it claimed + credit its XP/cents reward once. */
  async completeQuest(childId: string, questId: string) {
    return this.prisma.$transaction(async (tx) => {
      const quest = await tx.quest.findUnique({ where: { id: questId } });
      if (!quest || quest.childId !== childId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Quest not found.' });
      }
      if (quest.status === 'claimed') return quest; // idempotent — already rewarded
      if (quest.rewardCents > 0) {
        const bank = await tx.piggyBank.findFirst({
          where: { childId },
          orderBy: { createdAt: 'asc' },
        });
        if (bank) {
          await tx.transaction.create({
            data: {
              piggyBankId: bank.id,
              type: 'reward',
              amountCents: quest.rewardCents,
              note: quest.title,
            },
          });
          await tx.piggyBank.update({
            where: { id: bank.id },
            data: { balanceCents: { increment: quest.rewardCents } },
          });
        }
      }
      if (quest.rewardXp > 0) {
        await tx.child.update({
          where: { id: childId },
          data: { xp: { increment: quest.rewardXp } },
        });
      }
      return tx.quest.update({ where: { id: questId }, data: { status: 'claimed' } });
    });
  }

  /** Stats for the Wins screen: resisted impulses + level/balance/tasks for badges. */
  async childWins(childId: string) {
    const [child, agg, banks, tasksApproved] = await Promise.all([
      this.prisma.child.findUnique({ where: { id: childId }, select: { level: true, xp: true } }),
      this.prisma.resistedImpulse.aggregate({
        _count: true,
        _sum: { amountCents: true },
        where: { childId },
      }),
      this.prisma.piggyBank.findMany({ where: { childId }, select: { balanceCents: true } }),
      this.prisma.task.count({ where: { childId, status: 'approved' } }),
    ]);
    return {
      level: child?.level ?? 1,
      xp: child?.xp ?? 0,
      balanceCents: banks.reduce((s, b) => s + b.balanceCents, 0),
      resistedCount: agg._count,
      resistedCents: agg._sum.amountCents ?? 0,
      tasksApproved,
    };
  }

  /** A kid logs a resisted impulse; returns the refreshed Wins stats. */
  async resistImpulse(childId: string, input: ResistImpulseInput) {
    await this.prisma.resistedImpulse.create({
      data: { childId, amountCents: input.amountCents, item: input.item ?? null },
    });
    return this.childWins(childId);
  }

  /** Edit a kid's profile. Ownership is authorized by the router before this runs. */
  async updateChild(input: UpdateChildInput) {
    return this.prisma.child.update({
      where: { id: input.childId },
      // `undefined` leaves a field unchanged; `age: null` clears it.
      data: { displayName: input.displayName, age: input.age },
    });
  }

  /** Set a kid's allowance amount + autopay flag. */
  async updateAllowance(input: UpdateAllowanceInput) {
    return this.prisma.child.update({
      where: { id: input.childId },
      data: { allowanceCents: input.allowanceCents, autopayEnabled: input.autopayEnabled },
    });
  }

  /** Deactivate (blocks kid login) or reactivate a kid. */
  async setChildActive(input: SetChildActiveInput) {
    return this.prisma.child.update({
      where: { id: input.childId },
      data: { deactivatedAt: input.active ? null : new Date() },
    });
  }

  /** Permanently delete a kid. Piggy banks, goals, quests + tasks cascade (schema). */
  async deleteChild(childId: string): Promise<void> {
    await this.prisma.child.delete({ where: { id: childId } });
  }

  /** The owning parent's id for a child, or null if the child doesn't exist. */
  async childParentId(childId: string): Promise<string | null> {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
      select: { parentId: true },
    });
    return child?.parentId ?? null;
  }

  async listGoals(childId: string) {
    return this.prisma.savingsGoal.findMany({ where: { childId }, orderBy: { createdAt: 'asc' } });
  }

  async listQuests(childId: string) {
    return this.prisma.quest.findMany({ where: { childId }, orderBy: { createdAt: 'asc' } });
  }

  /** Headline numbers for the overview: counts, total saved, and paid this month. */
  async summaryByParent(parentId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [kids, toApproveCount, activeTaskCount, paidAgg] = await Promise.all([
      this.prisma.child.findMany({
        where: { parentId },
        select: { piggyBanks: { select: { balanceCents: true } } },
      }),
      this.prisma.task.count({ where: { child: { parentId }, status: 'submitted' } }),
      this.prisma.task.count({ where: { child: { parentId }, status: 'active' } }),
      this.prisma.transaction.aggregate({
        _sum: { amountCents: true },
        where: {
          piggyBank: { child: { parentId } },
          type: { in: ['reward', 'allowance'] },
          createdAt: { gte: monthStart },
        },
      }),
    ]);
    const savedCents = kids.reduce(
      (sum, k) => sum + k.piggyBanks.reduce((a, b) => a + b.balanceCents, 0),
      0,
    );
    return {
      toApproveCount,
      activeTaskCount,
      savedCents,
      paidThisMonthCents: paidAgg._sum.amountCents ?? 0,
    };
  }

  /** A recent-events feed derived from the parent's tasks + transactions (newest first). */
  async activityByParent(parentId: string) {
    const [tasks, txns] = await Promise.all([
      this.prisma.task.findMany({
        where: { child: { parentId } },
        orderBy: { updatedAt: 'desc' },
        take: 15,
      }),
      this.prisma.transaction.findMany({
        where: { piggyBank: { child: { parentId } } },
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: { piggyBank: { select: { childId: true } } },
      }),
    ]);
    const taskEvents = tasks.map((t) => {
      const kind =
        t.status === 'approved'
          ? ('task_approved' as const)
          : t.status === 'rejected'
            ? ('task_rejected' as const)
            : t.status === 'submitted'
              ? ('task_submitted' as const)
              : ('task_created' as const);
      const createdAt =
        t.status === 'approved' && t.resolvedAt
          ? t.resolvedAt
          : t.status === 'submitted' && t.submittedAt
            ? t.submittedAt
            : t.createdAt;
      return {
        id: `task:${t.id}`,
        kind,
        childId: t.childId,
        title: t.title,
        amountCents: t.amountCents || null,
        createdAt,
      };
    });
    const txEvents = txns.map((x) => ({
      id: `tx:${x.id}`,
      kind: x.type,
      childId: x.piggyBank.childId,
      title: x.note ?? x.type,
      amountCents: x.amountCents,
      createdAt: x.createdAt,
    }));
    return [...taskEvents, ...txEvents]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 15);
  }

  /** One aggregated row per child: summed balance + primary savings goal. */
  async dashboardByParent(parentId: string) {
    const kids = await this.prisma.child.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' },
      include: { piggyBanks: true, goals: { orderBy: { createdAt: 'asc' }, take: 1 } },
    });
    return kids.map((k) => {
      const goal = k.goals[0];
      return {
        id: k.id,
        displayName: k.displayName,
        avatarUrl: k.avatarUrl,
        age: k.age,
        level: k.level,
        xp: k.xp,
        balanceCents: k.piggyBanks.reduce((sum, b) => sum + b.balanceCents, 0),
        allowanceCents: k.allowanceCents,
        autopayEnabled: k.autopayEnabled,
        active: k.deactivatedAt === null,
        goal: goal
          ? { title: goal.title, targetCents: goal.targetCents, savedCents: goal.savedCents }
          : null,
      };
    });
  }
}
