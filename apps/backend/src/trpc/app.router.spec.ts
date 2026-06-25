import { TRPCError } from '@trpc/server';
import type { AuthClaims } from '../auth/jwt';
import {
  type AuthPort,
  createAppRouter,
  type FamilyPort,
  type PiggyPort,
  type TaskPort,
} from './app.router';
import type { TrpcContext } from './trpc.context';

const now = new Date('2026-01-02T03:04:05.000Z');

const piggy: PiggyPort = {
  async listPiggyBanks(childId) {
    return [
      {
        id: 'b1',
        childId,
        name: 'Ahorros',
        balanceCents: 34000,
        currency: 'USD',
        createdAt: now,
        updatedAt: now,
      },
    ];
  },
  async createTransaction(input) {
    return {
      id: 't1',
      piggyBankId: input.piggyBankId,
      type: input.type,
      amountCents: input.amountCents,
      note: input.note ?? null,
      createdAt: now,
      updatedAt: now,
    };
  },
  // b1 belongs to child c1 (owned by parent p1); anything else is unknown.
  async piggyBankChildId(piggyBankId) {
    return piggyBankId === 'b1' ? 'c1' : null;
  },
};

const family: FamilyPort = {
  async listChildren(parentId) {
    return [
      {
        id: 'c1',
        parentId,
        displayName: 'Marco',
        avatarUrl: null,
        level: 7,
        xp: 1240,
        createdAt: now,
        updatedAt: now,
      },
    ];
  },
  async listGoals(childId) {
    return [
      {
        id: 'g1',
        childId,
        title: 'Bici',
        targetCents: 50000,
        savedCents: 34000,
        achievedAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ];
  },
  async listQuests(childId) {
    return [
      {
        id: 'q1',
        childId,
        title: 'Presupuesto',
        description: 'x',
        rewardXp: 120,
        rewardCents: 0,
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      },
    ];
  },
  async dashboardByParent(_parentId) {
    return [
      {
        id: 'c1',
        displayName: 'Marco',
        avatarUrl: null,
        age: 12,
        level: 7,
        xp: 1240,
        balanceCents: 34000,
        allowanceCents: 5000,
        autopayEnabled: true,
        active: true,
        goal: { title: 'Bici', targetCents: 50000, savedCents: 34000 },
        resistedCount: 12,
        tasksApproved: 18,
      },
      {
        id: 'c2',
        displayName: 'Sofía',
        avatarUrl: null,
        age: 9,
        level: 4,
        xp: 540,
        balanceCents: 18000,
        allowanceCents: 3000,
        autopayEnabled: false,
        active: false,
        goal: null,
        resistedCount: 0,
        tasksApproved: 0,
      },
    ];
  },
  // c1 belongs to p1; everything else is unowned for these tests.
  async childParentId(childId) {
    return childId === 'c1' ? 'p1' : null;
  },
  async updateChild(input) {
    return {
      id: input.childId,
      parentId: 'p1',
      displayName: input.displayName ?? 'Marco',
      avatarUrl: null,
      level: 7,
      xp: 1240,
      createdAt: now,
      updatedAt: now,
    };
  },
  async updateAllowance(input) {
    return {
      id: input.childId,
      parentId: 'p1',
      displayName: 'Marco',
      avatarUrl: null,
      level: 7,
      xp: 1240,
      createdAt: now,
      updatedAt: now,
    };
  },
  async setChildActive(input) {
    return {
      id: input.childId,
      parentId: 'p1',
      displayName: 'Marco',
      avatarUrl: null,
      level: 7,
      xp: 1240,
      createdAt: now,
      updatedAt: now,
    };
  },
  async deleteChild(_childId) {},
  async summaryByParent(_parentId) {
    return { toApproveCount: 1, activeTaskCount: 2, savedCents: 52000, paidThisMonthCents: 5000 };
  },
  async activityByParent(_parentId) {
    return [
      {
        id: 'task:tk1',
        kind: 'task_approved',
        childId: 'c1',
        title: 'Basura',
        amountCents: 2000,
        createdAt: now,
      },
    ];
  },
  async reportsByParent(_parentId) {
    return {
      tasksByDay: [0, 1, 0, 2, 1, 3, 0],
      tasksCompletedThisWeek: 7,
      paidThisMonthCents: 5000,
      savedCents: 52000,
      activeKids: 2,
    };
  },
  async parentSettings(_parentId) {
    return {
      notifyEnabled: true,
      weeklyReportEnabled: true,
      autoApproveTasks: false,
      payoutMethod: 'card',
    };
  },
  async updateParentSettings(_parentId, input) {
    return {
      notifyEnabled: input.notifyEnabled ?? true,
      weeklyReportEnabled: input.weeklyReportEnabled ?? true,
      autoApproveTasks: input.autoApproveTasks ?? false,
      payoutMethod: input.payoutMethod ?? 'card',
    };
  },
  async childQuests(_childId) {
    return [
      {
        id: 'q1',
        childId: 'c1',
        title: 'Ahorra',
        description: 'x',
        rewardXp: 50,
        rewardCents: 0,
        status: 'available',
        createdAt: now,
        updatedAt: now,
      },
    ];
  },
  async completeQuest(_childId, questId) {
    return {
      id: questId,
      childId: 'c1',
      title: 'Ahorra',
      description: 'x',
      rewardXp: 50,
      rewardCents: 0,
      status: 'claimed',
      createdAt: now,
      updatedAt: now,
    };
  },
  async childWins(_childId) {
    return {
      level: 3,
      xp: 1240,
      balanceCents: 34000,
      resistedCount: 5,
      resistedCents: 12000,
      tasksApproved: 7,
    };
  },
  async resistImpulse(_childId, input) {
    return {
      level: 3,
      xp: 1240,
      balanceCents: 34000,
      resistedCount: 6,
      resistedCents: 12000 + input.amountCents,
      tasksApproved: 7,
    };
  },
  async childPatterns(_childId) {
    return {
      windowDays: 30,
      inflowCents: 10000,
      spentCents: 4000,
      savedToGoalsCents: 0,
      saveRate: 60,
      resistedCount: 2,
      resistedCents: 6000,
      patienceScore: 60,
    };
  },
};

const auth: AuthPort = {
  async registerParent(input) {
    return {
      token: 'tok-parent',
      user: {
        role: 'parent',
        id: 'p1',
        email: input.email,
        displayName: input.displayName,
        emailVerifiedAt: null,
      },
    };
  },
  async loginParent(input) {
    if (input.password === 'wrong') {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Wrong email or password.' });
    }
    return {
      token: 'tok-parent',
      user: {
        role: 'parent',
        id: 'p1',
        email: input.email,
        displayName: 'Patricia',
        emailVerifiedAt: null,
      },
    };
  },
  async loginChild(input) {
    return {
      token: 'tok-child',
      user: {
        role: 'child',
        id: 'c1',
        parentId: 'p1',
        username: input.username,
        displayName: 'Marco',
      },
    };
  },
  async verifyEmail(input) {
    if (input.token === 'bad') {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'This verification link is invalid.' });
    }
    return {
      token: 'tok-parent',
      user: {
        role: 'parent',
        id: 'p1',
        email: 'p@x.dev',
        displayName: 'Patricia',
        emailVerifiedAt: '2026-06-24T00:00:00.000Z',
      },
    };
  },
  async resendVerification(_parentId) {
    return { ok: true };
  },
  async requestPasswordReset(_input) {
    return { ok: true };
  },
  async resetPassword(input) {
    if (input.token === 'bad') {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'This reset link is invalid.' });
    }
    return { ok: true };
  },
  async me(claims) {
    if (claims.role === 'parent') {
      return {
        role: 'parent',
        id: claims.sub,
        email: 'p@x.dev',
        displayName: 'Patricia',
        emailVerifiedAt: null,
      };
    }
    return {
      role: 'child',
      id: claims.sub,
      parentId: claims.parentId ?? 'p1',
      username: 'marco',
      displayName: 'Marco',
    };
  },
  async createChild(parentId, input) {
    return {
      id: 'c9',
      parentId,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl ?? null,
      level: 1,
      xp: 0,
      createdAt: now,
      updatedAt: now,
    };
  },
  async resetChildPassword(_input) {
    return { ok: true };
  },
  async childHome(childId) {
    return {
      child: {
        role: 'child',
        id: childId,
        parentId: 'p1',
        username: 'marco',
        displayName: 'Marco',
        level: 7,
        xp: 1240,
      },
      balanceCents: 34000,
      goal: { title: 'Bici', targetCents: 50000, savedCents: 34000 },
      quests: [],
    };
  },
};

const baseTask = {
  id: 'tk1',
  childId: 'c1',
  title: 'Sacar basura',
  category: 'chore' as const,
  payType: 'money' as const,
  amountCents: 2000,
  rewardXp: 0,
  recurrence: 'weekly' as const,
  status: 'active' as const,
  note: null,
  submittedAt: null as Date | null,
  resolvedAt: null as Date | null,
  createdAt: now,
  updatedAt: now,
};

const task: TaskPort = {
  // tk1 → child c1 (owned by p1); tk2 → child c2 (owned by p2); else unknown.
  async taskChildId(taskId) {
    if (taskId === 'tk1') return 'c1';
    if (taskId === 'tk2') return 'c2';
    return null;
  },
  async createTask(input) {
    return {
      ...baseTask,
      id: 'tk9',
      childId: input.childId,
      title: input.title,
      category: input.category,
      payType: input.payType,
      amountCents: input.amountCents,
      rewardXp: input.rewardXp,
      recurrence: input.recurrence,
    };
  },
  async listByParent(_parentId) {
    return [baseTask];
  },
  async pendingApprovals(_parentId) {
    return [{ ...baseTask, status: 'submitted', submittedAt: now }];
  },
  async listByChild(_childId) {
    return [baseTask];
  },
  async submitTask(input) {
    return { ...baseTask, id: input.taskId, status: 'submitted', submittedAt: now };
  },
  async approveTask(taskId) {
    return { ...baseTask, id: taskId, status: 'approved', resolvedAt: now };
  },
  async rejectTask(taskId) {
    return { ...baseTask, id: taskId, status: 'active' };
  },
  async deleteTask(_taskId) {},
};

const appRouter = createAppRouter({ piggy, family, auth, task });

const ctx = (user: AuthClaims | null): TrpcContext => ({ token: user ? 'tok' : null, user });
const anon = appRouter.createCaller(ctx(null));
const parent = appRouter.createCaller(ctx({ sub: 'p1', role: 'parent' }));
const child = appRouter.createCaller(ctx({ sub: 'c1', role: 'child', parentId: 'p1' }));
const otherChild = appRouter.createCaller(ctx({ sub: 'c2', role: 'child', parentId: 'p2' }));

describe('appRouter', () => {
  it('health returns ok (public)', async () => {
    const res = await anon.health();
    expect(res.status).toBe('ok');
    expect(res.service).toBe('backend');
  });

  describe('auth', () => {
    it('registers a parent and returns a session', async () => {
      const s = await anon.auth.registerParent({
        email: 'new@x.dev',
        password: 'password123',
        displayName: 'New',
      });
      expect(s.token).toBe('tok-parent');
      expect(s.user.role).toBe('parent');
    });

    it('rejects a wrong-password login', async () => {
      await expect(anon.auth.loginParent({ email: 'p@x.dev', password: 'wrong' })).rejects.toThrow(
        /wrong/i,
      );
    });

    it('logs a kid in by username', async () => {
      const s = await anon.auth.loginChild({ username: 'marco', password: 'piggy1234' });
      expect(s.user.role).toBe('child');
      if (s.user.role === 'child') expect(s.user.username).toBe('marco');
    });

    it('verifies an email token (public) and returns a verified session', async () => {
      const s = await anon.auth.verifyEmail({ token: 'good' });
      expect(s.user.role).toBe('parent');
      if (s.user.role === 'parent') expect(s.user.emailVerifiedAt).not.toBeNull();
    });

    it('rejects a bad verification token', async () => {
      await expect(anon.auth.verifyEmail({ token: 'bad' })).rejects.toThrow(/invalid/i);
    });

    it('resendVerification is parents-only', async () => {
      await expect(anon.auth.resendVerification()).rejects.toThrow();
      await expect(child.auth.resendVerification()).rejects.toThrow(/parents only/i);
      expect(await parent.auth.resendVerification()).toEqual({ ok: true });
    });

    it('requestPasswordReset is public and always returns ok', async () => {
      expect(await anon.auth.requestPasswordReset({ email: 'whoever@x.dev' })).toEqual({
        ok: true,
      });
    });

    it('resetPassword accepts a good token and rejects a bad one', async () => {
      expect(await anon.auth.resetPassword({ token: 'good', password: 'password123' })).toEqual({
        ok: true,
      });
      await expect(
        anon.auth.resetPassword({ token: 'bad', password: 'password123' }),
      ).rejects.toThrow(/invalid/i);
    });

    it('me requires a token', async () => {
      await expect(anon.auth.me()).rejects.toThrow();
    });

    it('me resolves the current parent', async () => {
      const me = await parent.auth.me();
      expect(me.role).toBe('parent');
    });
  });

  describe('children (parent-scoped)', () => {
    it('rejects an anonymous dashboard request', async () => {
      await expect(anon.children.dashboard()).rejects.toThrow();
    });

    it('rejects a kid hitting the parent dashboard', async () => {
      await expect(child.children.dashboard()).rejects.toThrow(/parents only/i);
    });

    it('aggregates dashboard rows for the signed-in parent', async () => {
      const rows = await parent.children.dashboard();
      expect(rows).toHaveLength(2);
      expect(rows[0]?.balanceCents).toBe(34000);
      expect(rows[0]?.autopayEnabled).toBe(true);
      expect(rows[0]?.active).toBe(true);
      expect(rows[1]?.active).toBe(false);
      expect(rows[1]?.goal).toBeUndefined();
    });

    it('lists the parent’s children with null avatarUrl mapped to undefined', async () => {
      const kids = await parent.children.list();
      expect(kids[0]?.displayName).toBe('Marco');
      expect(kids[0]?.avatarUrl).toBeUndefined();
    });

    it('creates a kid account for the signed-in parent', async () => {
      const kid = await parent.children.create({
        displayName: 'Nina',
        username: 'nina',
        password: 'password123',
      });
      expect(kid.displayName).toBe('Nina');
      expect(kid.parentId).toBe('p1');
    });

    it('updates an owned child; blocks unowned + non-parent callers', async () => {
      const updated = await parent.children.update({ childId: 'c1', displayName: 'Marco A.' });
      expect(updated.displayName).toBe('Marco A.');
      await expect(parent.children.update({ childId: 'c2', displayName: 'x' })).rejects.toThrow(
        /not your/i,
      );
      await expect(child.children.update({ childId: 'c1', displayName: 'x' })).rejects.toThrow(
        /parents only/i,
      );
    });

    it('sets allowance, resets password, toggles active, and deletes (owner only)', async () => {
      const al = await parent.children.updateAllowance({
        childId: 'c1',
        allowanceCents: 5000,
        autopayEnabled: true,
      });
      expect(al.id).toBe('c1');
      expect(
        await parent.children.resetPassword({ childId: 'c1', password: 'password123' }),
      ).toEqual({ ok: true });
      const deact = await parent.children.setActive({ childId: 'c1', active: false });
      expect(deact.id).toBe('c1');
      expect(await parent.children.delete({ childId: 'c1' })).toEqual({ ok: true });
      await expect(parent.children.delete({ childId: 'c2' })).rejects.toThrow(/not your/i);
    });

    it('returns overview summary + activity for the parent', async () => {
      const s = await parent.children.summary();
      expect(s.paidThisMonthCents).toBe(5000);
      expect(s.savedCents).toBe(52000);
      const a = await parent.children.activity();
      expect(a[0]?.kind).toBe('task_approved');
      expect(a[0]?.amountCents).toBe(2000);
    });
  });

  describe('tasks', () => {
    const chore = {
      category: 'chore' as const,
      payType: 'money' as const,
      amountCents: 2000,
      rewardXp: 0,
      recurrence: 'once' as const,
    };

    it('parent creates a task for an owned kid; blocks unowned + non-parent', async () => {
      const t = await parent.tasks.create({ childId: 'c1', title: 'Sacar basura', ...chore });
      expect(t.title).toBe('Sacar basura');
      expect(t.status).toBe('active');
      await expect(parent.tasks.create({ childId: 'c2', title: 'x', ...chore })).rejects.toThrow(
        /not your/i,
      );
      await expect(child.tasks.create({ childId: 'c1', title: 'x', ...chore })).rejects.toThrow(
        /parents only/i,
      );
    });

    it('lists parent tasks + pending approvals', async () => {
      expect((await parent.tasks.listByParent())[0]?.title).toBe('Sacar basura');
      const pending = await parent.tasks.pendingApprovals();
      expect(pending[0]?.status).toBe('submitted');
    });

    it('kid submits their own task; another kid is blocked', async () => {
      const t = await child.tasks.submit({ taskId: 'tk1' });
      expect(t.status).toBe('submitted');
      await expect(otherChild.tasks.submit({ taskId: 'tk1' })).rejects.toThrow(/not your/i);
    });

    it('parent approves/rejects/deletes an owned task; blocks cross-parent + unknown', async () => {
      expect((await parent.tasks.approve({ taskId: 'tk1' })).status).toBe('approved');
      expect((await parent.tasks.reject({ taskId: 'tk1' })).status).toBe('active');
      expect(await parent.tasks.delete({ taskId: 'tk1' })).toEqual({ ok: true });
      await expect(parent.tasks.approve({ taskId: 'tk2' })).rejects.toThrow(/not your/i);
      await expect(parent.tasks.approve({ taskId: 'ghost' })).rejects.toThrow(/not found/i);
    });
  });

  describe('parent settings + reports', () => {
    it('reads and updates settings (parents only)', async () => {
      const s = await parent.parent.settings();
      expect(s.payoutMethod).toBe('card');
      const u = await parent.parent.updateSettings({
        autoApproveTasks: true,
        payoutMethod: 'bank',
      });
      expect(u.autoApproveTasks).toBe(true);
      expect(u.payoutMethod).toBe('bank');
      await expect(child.parent.settings()).rejects.toThrow(/parents only/i);
    });

    it('returns reports aggregates for the parent', async () => {
      const r = await parent.children.reports();
      expect(r.tasksCompletedThisWeek).toBe(7);
      expect(r.tasksByDay).toHaveLength(7);
    });
  });

  describe('me.home (child-scoped)', () => {
    it('returns the signed-in kid’s home payload', async () => {
      const home = await child.me.home();
      expect(home.balanceCents).toBe(34000);
      expect(home.child.id).toBe('c1');
    });

    it('rejects a parent calling the kid home', async () => {
      await expect(parent.me.home()).rejects.toThrow(/kids only/i);
    });

    it('serves the kid quests + wins, completes a quest, logs a resisted impulse', async () => {
      expect((await child.me.quests())[0]?.status).toBe('available');
      expect((await child.me.completeQuest({ questId: 'q1' })).status).toBe('claimed');
      expect((await child.me.wins()).resistedCount).toBe(5);
      const after = await child.me.resistImpulse({ amountCents: 500 });
      expect(after.resistedCount).toBe(6);
      expect(after.resistedCents).toBe(12500);
      await expect(parent.me.quests()).rejects.toThrow(/kids only/i);
    });
  });

  describe('per-child access control', () => {
    it('lets the owning kid read their piggy banks', async () => {
      const banks = await child.piggy.listByChild({ childId: 'c1' });
      expect(banks[0]?.balanceCents).toBe(34000);
      expect(banks[0]?.createdAt).toBe(now.toISOString());
    });

    it('blocks a kid from reading another kid’s data', async () => {
      await expect(otherChild.piggy.listByChild({ childId: 'c1' })).rejects.toThrow(/not your/i);
    });

    it('lets the owning parent read a child’s goals/quests', async () => {
      const goals = await parent.goals.listByChild({ childId: 'c1' });
      expect(goals[0]?.achievedAt).toBeUndefined();
      const quests = await parent.quests.listByChild({ childId: 'c1' });
      expect(quests[0]?.status).toBe('completed');
    });

    it('blocks a parent from reading a child they don’t own', async () => {
      await expect(parent.goals.listByChild({ childId: 'c1-other' })).rejects.toThrow(/not your/i);
    });

    it('creates a transaction on an owned bank and maps a null note to undefined', async () => {
      const tx = await parent.piggy.createTransaction({
        piggyBankId: 'b1',
        type: 'deposit',
        amountCents: 500,
      });
      expect(tx.amountCents).toBe(500);
      expect(tx.note).toBeUndefined();
    });

    it('lets the owning kid transact on their own bank', async () => {
      const tx = await child.piggy.createTransaction({
        piggyBankId: 'b1',
        type: 'deposit',
        amountCents: 100,
      });
      expect(tx.amountCents).toBe(100);
    });

    it('blocks a kid from transacting on another family’s bank', async () => {
      await expect(
        otherChild.piggy.createTransaction({
          piggyBankId: 'b1',
          type: 'withdrawal',
          amountCents: 100,
        }),
      ).rejects.toThrow(/not your/i);
    });

    it('rejects a transaction against an unknown bank (NOT_FOUND)', async () => {
      await expect(
        parent.piggy.createTransaction({ piggyBankId: 'ghost', type: 'deposit', amountCents: 100 }),
      ).rejects.toThrow(/not found/i);
    });

    it('rejects invalid transaction input via zod', async () => {
      await expect(
        parent.piggy.createTransaction({ piggyBankId: '', type: 'deposit', amountCents: -5 }),
      ).rejects.toThrow();
    });

    it('rejects an anonymous transaction', async () => {
      await expect(
        anon.piggy.createTransaction({ piggyBankId: 'b1', type: 'deposit', amountCents: 500 }),
      ).rejects.toThrow();
    });
  });
});
