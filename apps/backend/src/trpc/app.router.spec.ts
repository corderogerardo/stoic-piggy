import { TRPCError } from '@trpc/server';
import type { AuthClaims } from '../auth/jwt';
import { type AuthPort, createAppRouter, type FamilyPort, type PiggyPort } from './app.router';
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
        goal: { title: 'Bici', targetCents: 50000, savedCents: 34000 },
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
        goal: null,
      },
    ];
  },
  // c1 belongs to p1; everything else is unowned for these tests.
  async childParentId(childId) {
    return childId === 'c1' ? 'p1' : null;
  },
};

const auth: AuthPort = {
  async registerParent(input) {
    return {
      token: 'tok-parent',
      user: { role: 'parent', id: 'p1', email: input.email, displayName: input.displayName },
    };
  },
  async loginParent(input) {
    if (input.password === 'wrong') {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Wrong email or password.' });
    }
    return {
      token: 'tok-parent',
      user: { role: 'parent', id: 'p1', email: input.email, displayName: 'Patricia' },
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
  async me(claims) {
    if (claims.role === 'parent') {
      return { role: 'parent', id: claims.sub, email: 'p@x.dev', displayName: 'Patricia' };
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

const appRouter = createAppRouter({ piggy, family, auth });

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
