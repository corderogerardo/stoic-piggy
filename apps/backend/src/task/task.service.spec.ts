import type { PrismaService } from '../prisma/prisma.service';
import { TaskService } from './task.service';

function makeTx() {
  return {
    task: { findUnique: jest.fn(), update: jest.fn().mockResolvedValue({ status: 'approved' }) },
    piggyBank: { findFirst: jest.fn(), update: jest.fn() },
    transaction: { create: jest.fn() },
    child: { update: jest.fn() },
  };
}

/** A PrismaService whose $transaction runs the callback against the given tx mock. */
function prismaWith(tx: ReturnType<typeof makeTx>): PrismaService {
  return {
    $transaction: (cb: (t: typeof tx) => Promise<unknown>) => cb(tx),
  } as unknown as PrismaService;
}

describe('TaskService.approveTask', () => {
  it('credits the primary piggy bank and marks the task approved (money)', async () => {
    const tx = makeTx();
    tx.task.findUnique.mockResolvedValue({
      id: 'tk1',
      childId: 'c1',
      title: 'Basura',
      payType: 'money',
      amountCents: 2000,
      rewardXp: 0,
    });
    tx.piggyBank.findFirst.mockResolvedValue({ id: 'b1' });

    const res = await new TaskService(prismaWith(tx)).approveTask('tk1');

    expect(tx.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'reward', amountCents: 2000, piggyBankId: 'b1' }),
      }),
    );
    expect(tx.piggyBank.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { balanceCents: { increment: 2000 } } }),
    );
    expect(tx.child.update).not.toHaveBeenCalled();
    expect((res as { status: string }).status).toBe('approved');
  });

  it('awards xp without touching the bank (xp task)', async () => {
    const tx = makeTx();
    tx.task.findUnique.mockResolvedValue({
      id: 'tk2',
      childId: 'c1',
      title: 'Leer',
      payType: 'xp',
      amountCents: 0,
      rewardXp: 50,
    });

    await new TaskService(prismaWith(tx)).approveTask('tk2');

    expect(tx.child.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { xp: { increment: 50 } } }),
    );
    expect(tx.transaction.create).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND for a missing task', async () => {
    const tx = makeTx();
    tx.task.findUnique.mockResolvedValue(null);
    await expect(new TaskService(prismaWith(tx)).approveTask('ghost')).rejects.toThrow(
      /not found/i,
    );
  });
});
