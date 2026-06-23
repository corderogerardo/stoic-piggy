import { createAppRouter, type FamilyPort, type PiggyPort } from './app.router';

const now = new Date('2026-01-02T03:04:05.000Z');

const piggy: PiggyPort = {
  async listPiggyBanks(childId) {
    return [{ id: 'b1', childId, name: 'Ahorros', balanceCents: 34000, currency: 'USD', createdAt: now, updatedAt: now }];
  },
  async createTransaction(input) {
    return { id: 't1', piggyBankId: input.piggyBankId, type: input.type, amountCents: input.amountCents, note: input.note ?? null, createdAt: now, updatedAt: now };
  },
};

const family: FamilyPort = {
  async listChildren(parentId) {
    return [{ id: 'c1', parentId, displayName: 'Marco', avatarUrl: null, level: 7, xp: 1240, createdAt: now, updatedAt: now }];
  },
  async listGoals(childId) {
    return [{ id: 'g1', childId, title: 'Bici', targetCents: 50000, savedCents: 34000, achievedAt: null, createdAt: now, updatedAt: now }];
  },
  async listQuests(childId) {
    return [{ id: 'q1', childId, title: 'Presupuesto', description: 'x', rewardXp: 120, rewardCents: 0, status: 'completed', createdAt: now, updatedAt: now }];
  },
  async dashboardByParent(parentId) {
    return [
      { id: 'c1', displayName: 'Marco', avatarUrl: null, age: 12, level: 7, xp: 1240, balanceCents: 34000, allowanceCents: 5000, autopayEnabled: true, goal: { title: 'Bici', targetCents: 50000, savedCents: 34000 } },
      { id: 'c2', displayName: 'Sofía', avatarUrl: null, age: 9, level: 4, xp: 540, balanceCents: 18000, allowanceCents: 3000, autopayEnabled: false, goal: null },
    ];
  },
};

const caller = createAppRouter({ piggy, family }).createCaller({ token: null });

describe('appRouter', () => {
  it('health returns ok', async () => {
    const res = await caller.health();
    expect(res.status).toBe('ok');
    expect(res.service).toBe('backend');
  });

  it('maps piggy bank dates to ISO strings', async () => {
    const banks = await caller.piggy.listByChild({ childId: 'c1' });
    expect(banks).toHaveLength(1);
    expect(banks[0].createdAt).toBe(now.toISOString());
    expect(banks[0].balanceCents).toBe(34000);
  });

  it('creates a transaction and maps a null note to undefined', async () => {
    const tx = await caller.piggy.createTransaction({ piggyBankId: 'b1', type: 'deposit', amountCents: 500 });
    expect(tx.amountCents).toBe(500);
    expect(tx.note).toBeUndefined();
  });

  it('rejects invalid transaction input via zod', async () => {
    await expect(caller.piggy.createTransaction({ piggyBankId: '', type: 'deposit', amountCents: -5 })).rejects.toThrow();
  });

  it('lists children and maps null avatarUrl to undefined', async () => {
    const kids = await caller.children.listByParent({ parentId: 'p1' });
    expect(kids[0].displayName).toBe('Marco');
    expect(kids[0].avatarUrl).toBeUndefined();
  });

  it('aggregates dashboard rows and maps a null goal to undefined', async () => {
    const rows = await caller.children.dashboardByParent({ parentId: 'p1' });
    expect(rows).toHaveLength(2);
    expect(rows[0].balanceCents).toBe(34000);
    expect(rows[0].autopayEnabled).toBe(true);
    expect(rows[0].goal?.targetCents).toBe(50000);
    expect(rows[1].goal).toBeUndefined();
  });

  it('lists goals and quests for a child', async () => {
    const goals = await caller.goals.listByChild({ childId: 'c1' });
    expect(goals[0].achievedAt).toBeUndefined();
    const quests = await caller.quests.listByChild({ childId: 'c1' });
    expect(quests[0].status).toBe('completed');
  });
});
