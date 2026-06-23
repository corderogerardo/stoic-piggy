import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FamilyService {
  constructor(private readonly prisma: PrismaService) {}

  async listChildren(parentId: string) {
    return this.prisma.child.findMany({ where: { parentId }, orderBy: { createdAt: 'asc' } });
  }

  async listGoals(childId: string) {
    return this.prisma.savingsGoal.findMany({ where: { childId }, orderBy: { createdAt: 'asc' } });
  }

  async listQuests(childId: string) {
    return this.prisma.quest.findMany({ where: { childId }, orderBy: { createdAt: 'asc' } });
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
        goal: goal
          ? { title: goal.title, targetCents: goal.targetCents, savedCents: goal.savedCents }
          : null,
      };
    });
  }
}
