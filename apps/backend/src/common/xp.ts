import type { Prisma } from '@prisma/client';
import { levelForXp, levelUpRewardCents } from '@stoicpiggy/shared';

/**
 * Add XP to a child and, for every level boundary crossed, credit the level-up
 * cash reward into their primary piggy bank. Runs inside the caller's
 * transaction so the XP, the money, and the action that earned it all commit
 * together. No-op for non-positive deltas. Money stops once the kid is capped at
 * the top level (levelForXp caps, so no further boundaries are crossed).
 */
export async function applyXpGain(
  tx: Prisma.TransactionClient,
  childId: string,
  deltaXp: number,
): Promise<void> {
  if (deltaXp <= 0) return;
  const child = await tx.child.findUnique({ where: { id: childId }, select: { xp: true } });
  if (!child) return;

  const newXp = child.xp + deltaXp;
  await tx.child.update({ where: { id: childId }, data: { xp: newXp } });

  const rewardCents = levelUpRewardCents(child.xp, newXp);
  if (rewardCents <= 0) return;
  const bank = await tx.piggyBank.findFirst({ where: { childId }, orderBy: { createdAt: 'asc' } });
  if (!bank) return; // ponytail: no bank → XP still lands, money has nowhere to go
  await tx.transaction.create({
    data: {
      piggyBankId: bank.id,
      type: 'reward',
      amountCents: rewardCents,
      note: `¡Subiste a nivel ${levelForXp(newXp)}!`,
    },
  });
  await tx.piggyBank.update({
    where: { id: bank.id },
    data: { balanceCents: { increment: rewardCents } },
  });
}
