import { Injectable } from '@nestjs/common';
import type { CreateTransactionInput } from '@stoicpiggy/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PiggyService {
  constructor(private readonly prisma: PrismaService) {}

  listPiggyBanks(childId: string) {
    return this.prisma.piggyBank.findMany({ where: { childId } });
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
