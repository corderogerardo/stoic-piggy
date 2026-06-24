import { Injectable } from '@nestjs/common';
import type { CreateTransactionInput } from '@stoicpiggy/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PiggyService {
  constructor(private readonly prisma: PrismaService) {}

  async listPiggyBanks(childId: string) {
    return this.prisma.piggyBank.findMany({ where: { childId } });
  }

  /** The child that owns a piggy bank, or null if it doesn't exist. */
  async piggyBankChildId(piggyBankId: string): Promise<string | null> {
    const bank = await this.prisma.piggyBank.findUnique({
      where: { id: piggyBankId },
      select: { childId: true },
    });
    return bank?.childId ?? null;
  }

  createTransaction(input: CreateTransactionInput) {
    const delta = input.type === 'withdrawal' ? -input.amountCents : input.amountCents;

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({ data: input });
      await tx.piggyBank.update({
        where: { id: input.piggyBankId },
        data: { balanceCents: { increment: delta } },
      });
      return transaction;
    });
  }
}
