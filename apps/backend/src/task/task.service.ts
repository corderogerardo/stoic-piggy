import { Injectable } from '@nestjs/common';
import type { CreateTaskInput, SubmitTaskInput } from '@stoicpiggy/shared';
import { TRPCError } from '@trpc/server';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  /** The owning child of a task, or null if it doesn't exist (for authorization). */
  async taskChildId(taskId: string): Promise<string | null> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { childId: true },
    });
    return task?.childId ?? null;
  }

  /** A parent assigns a task to a kid. */
  createTask(input: CreateTaskInput) {
    return this.prisma.task.create({
      data: {
        childId: input.childId,
        title: input.title,
        category: input.category,
        payType: input.payType,
        amountCents: input.amountCents,
        rewardXp: input.rewardXp,
        recurrence: input.recurrence,
      },
    });
  }

  /** All tasks across a parent's kids (newest first). */
  listByParent(parentId: string) {
    return this.prisma.task.findMany({
      where: { child: { parentId } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Tasks a kid submitted and the parent hasn't resolved yet (the Approvals queue). */
  pendingApprovals(parentId: string) {
    return this.prisma.task.findMany({
      where: { child: { parentId }, status: 'submitted' },
      orderBy: { submittedAt: 'desc' },
    });
  }

  /** A kid's own tasks (newest first). */
  listByChild(childId: string) {
    return this.prisma.task.findMany({ where: { childId }, orderBy: { createdAt: 'desc' } });
  }

  /**
   * A kid marks a task done → submitted. If the parent enabled auto-approval, it's
   * approved + paid out immediately instead of waiting in the queue.
   */
  async submitTask(input: SubmitTaskInput) {
    const task = await this.prisma.task.findUnique({
      where: { id: input.taskId },
      select: { child: { select: { parent: { select: { autoApproveTasks: true } } } } },
    });
    if (!task) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found.' });
    const submitted = await this.prisma.task.update({
      where: { id: input.taskId },
      data: { status: 'submitted', submittedAt: new Date(), note: input.note ?? null },
    });
    return task.child.parent.autoApproveTasks ? this.approveTask(input.taskId) : submitted;
  }

  /**
   * A parent approves a submitted task. In ONE transaction: credit the kid's primary
   * piggy bank (for money/both) and/or award XP (for xp/both), then mark it approved.
   */
  approveTask(taskId: string) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: taskId } });
      if (!task) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found.' });

      if (task.payType !== 'xp' && task.amountCents > 0) {
        const bank = await tx.piggyBank.findFirst({
          where: { childId: task.childId },
          orderBy: { createdAt: 'asc' },
        });
        if (bank) {
          await tx.transaction.create({
            data: {
              piggyBankId: bank.id,
              type: 'reward',
              amountCents: task.amountCents,
              note: task.title,
            },
          });
          await tx.piggyBank.update({
            where: { id: bank.id },
            data: { balanceCents: { increment: task.amountCents } },
          });
        }
      }
      if (task.payType !== 'money' && task.rewardXp > 0) {
        await tx.child.update({
          where: { id: task.childId },
          data: { xp: { increment: task.rewardXp } },
        });
      }
      return tx.task.update({
        where: { id: taskId },
        data: { status: 'approved', resolvedAt: new Date() },
      });
    });
  }

  /** A parent rejects a submitted task → back to active (sent back to the kid). */
  rejectTask(taskId: string) {
    return this.prisma.task.update({
      where: { id: taskId },
      data: { status: 'active', submittedAt: null },
    });
  }

  /** A parent deletes a task. */
  async deleteTask(taskId: string): Promise<void> {
    await this.prisma.task.delete({ where: { id: taskId } });
  }
}
