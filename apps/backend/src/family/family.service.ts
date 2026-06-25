import { Injectable } from '@nestjs/common';
import type {
  SetChildActiveInput,
  UpdateAllowanceInput,
  UpdateChildInput,
} from '@stoicpiggy/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FamilyService {
  constructor(private readonly prisma: PrismaService) {}

  async listChildren(parentId: string) {
    return this.prisma.child.findMany({ where: { parentId }, orderBy: { createdAt: 'asc' } });
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
