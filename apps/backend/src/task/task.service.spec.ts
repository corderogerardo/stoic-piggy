import type { PrismaService } from '../prisma/prisma.service';
import { TaskService } from './task.service';

function makeTx() {
  return {
    task: { findUnique: jest.fn(), update: jest.fn().mockResolvedValue({ status: 'approved' }) },
    piggyBank: { findFirst: jest.fn(), update: jest.fn() },
    transaction: { create: jest.fn() },
    child: { findUnique: jest.fn(), update: jest.fn() },
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

  it('awards xp without touching the bank (xp task, no level-up)', async () => {
    const tx = makeTx();
    tx.task.findUnique.mockResolvedValue({
      id: 'tk2',
      childId: 'c1',
      title: 'Leer',
      payType: 'xp',
      amountCents: 0,
      rewardXp: 50,
    });
    tx.child.findUnique.mockResolvedValue({ xp: 100 }); // 100 → 150, stays level 1

    await new TaskService(prismaWith(tx)).approveTask('tk2');

    expect(tx.child.update).toHaveBeenCalledWith(expect.objectContaining({ data: { xp: 150 } }));
    expect(tx.transaction.create).not.toHaveBeenCalled(); // no boundary crossed → no $
  });

  it('pays $5 into the bank when xp crosses a level boundary', async () => {
    const tx = makeTx();
    tx.task.findUnique.mockResolvedValue({
      id: 'tk3',
      childId: 'c1',
      title: 'Lección',
      payType: 'xp',
      amountCents: 0,
      rewardXp: 100,
    });
    tx.child.findUnique.mockResolvedValue({ xp: 950 }); // 950 → 1050 crosses level 1 → 2
    tx.piggyBank.findFirst.mockResolvedValue({ id: 'b1' });

    await new TaskService(prismaWith(tx)).approveTask('tk3');

    expect(tx.child.update).toHaveBeenCalledWith(expect.objectContaining({ data: { xp: 1050 } }));
    expect(tx.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'reward', amountCents: 500, piggyBankId: 'b1' }),
      }),
    );
    expect(tx.piggyBank.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { balanceCents: { increment: 500 } } }),
    );
  });

  it('throws NOT_FOUND for a missing task', async () => {
    const tx = makeTx();
    tx.task.findUnique.mockResolvedValue(null);
    await expect(new TaskService(prismaWith(tx)).approveTask('ghost')).rejects.toThrow(
      /not found/i,
    );
  });
});

describe('TaskService.submitTask', () => {
  it('marks the task submitted when the parent has not enabled auto-approve', async () => {
    const prisma = {
      task: {
        findUnique: jest.fn().mockResolvedValue({ child: { parent: { autoApproveTasks: false } } }),
        update: jest.fn().mockResolvedValue({ id: 'tk1', status: 'submitted' }),
      },
    } as unknown as PrismaService;
    const res = await new TaskService(prisma).submitTask({ taskId: 'tk1' });
    expect((res as { status: string }).status).toBe('submitted');
  });

  it('auto-approves + pays out when the parent enabled auto-approve', async () => {
    const tx = makeTx();
    tx.task.findUnique.mockResolvedValue({
      id: 'tk1',
      childId: 'c1',
      title: 'x',
      payType: 'money',
      amountCents: 1000,
      rewardXp: 0,
    });
    tx.piggyBank.findFirst.mockResolvedValue({ id: 'b1' });
    const prisma = {
      task: {
        findUnique: jest.fn().mockResolvedValue({ child: { parent: { autoApproveTasks: true } } }),
        update: jest.fn().mockResolvedValue({ id: 'tk1', status: 'submitted' }),
      },
      $transaction: (cb: (t: typeof tx) => Promise<unknown>) => cb(tx),
    } as unknown as PrismaService;
    await new TaskService(prisma).submitTask({ taskId: 'tk1' });
    expect(tx.piggyBank.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { balanceCents: { increment: 1000 } } }),
    );
  });
});
