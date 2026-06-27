process.env.JWT_SECRET ??= 'integration-secret';
process.env.APP_URL ??= 'http://localhost:3002';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import type { AuthClaims } from '../src/auth/jwt';
import { PrismaService } from '../src/prisma/prisma.service';
import type { AppRouter } from '../src/trpc/app.router';
import type { TrpcContext } from '../src/trpc/trpc.context';
import { TrpcRouter } from '../src/trpc/trpc.router';

// Goal endpoints (create / contribute / delete) against a REAL Postgres — the
// local docker-compose db or CI's service container. Mirrors auth.db.e2e: if no
// local database is reachable the suite no-ops so `test:e2e` stays green for
// devs without a DB. CI sets REQUIRE_DB=1 so a broken DB can't silently skip.
describe('goals flow (e2e, real Postgres)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let auth: AuthService;
  let appRouter: AppRouter;
  let dbAvailable = false;

  const stamp = Date.now();
  const email = `goals-parent-${stamp}@e2e.dev`;
  const username = `gk${stamp}`;
  const password = 'password123';

  const ctx = (user: AuthClaims | null): TrpcContext => ({ token: user ? 'tok' : null, user });
  const caller = (user: AuthClaims | null) => appRouter.createCaller(ctx(user));

  let kidId = '';
  let kidClaims: AuthClaims;
  let parentClaims: AuthClaims;
  /** A fresh tRPC caller acting as the signed-in kid. */
  const kid = () => caller(kidClaims);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    auth = app.get(AuthService);
    appRouter = app.get(TrpcRouter).appRouter;

    const requireDb = process.env.REQUIRE_DB === '1';
    // SAFETY: only ever run this destructive flow against a local/CI database.
    const url = process.env.DATABASE_URL ?? '';
    const isLocal = /localhost|127\.0\.0\.1|@db:/.test(url);
    if (!isLocal) {
      if (requireDb) {
        throw new Error(`[goals.db.e2e] REQUIRE_DB=1 but DATABASE_URL is not local: "${url}".`);
      }
      // eslint-disable-next-line no-console
      console.warn('[goals.db.e2e] DATABASE_URL is not local — skipping integration assertions.');
      return;
    }
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbAvailable = true;
    } catch (error) {
      if (requireDb) throw error;
      // eslint-disable-next-line no-console
      console.warn('[goals.db.e2e] No database reachable — skipping integration assertions.');
      return;
    }

    // One parent + kid for the whole suite; each test starts from a clean slate.
    const parentSession = await caller(null).auth.registerParent({
      email,
      password,
      displayName: 'Goals Parent',
    });
    const pc = auth.verify(parentSession.token);
    if (!pc) throw new Error('[goals.db.e2e] parent token failed to verify');
    parentClaims = pc;

    const kidRow = await caller(parentClaims).children.create({
      displayName: 'Goals Kid',
      username,
      password,
    });
    kidId = kidRow.id;

    const kidSession = await caller(null).auth.loginChild({ username, password });
    const kc = auth.verify(kidSession.token);
    if (!kc) throw new Error('[goals.db.e2e] kid token failed to verify');
    kidClaims = kc;
  });

  beforeEach(async () => {
    if (dbAvailable) await prisma.savingsGoal.deleteMany({ where: { childId: kidId } });
  });

  afterAll(async () => {
    if (dbAvailable) {
      await prisma.parent.deleteMany({ where: { email } }).catch(() => undefined);
    }
    await app?.close();
  });

  it('creates a goal with term + category and lists it back', async () => {
    if (!dbAvailable) return;
    const created = await kid().goals.create({
      title: 'New bike',
      targetCents: 15000,
      term: 'medium',
      category: 'thing',
    });
    expect(created).toMatchObject({
      title: 'New bike',
      targetCents: 15000,
      savedCents: 0,
      term: 'medium',
      category: 'thing',
    });
    expect(created.achievedAt).toBeUndefined();

    const list = await kid().goals.listByChild({ childId: kidId });
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe(created.id);
  });

  it('enforces a maximum of 3 goals per kid', async () => {
    if (!dbAvailable) return;
    for (let i = 0; i < 3; i++) {
      await kid().goals.create({
        title: `Goal ${i}`,
        targetCents: 1000,
        term: 'short',
        category: 'thing',
      });
    }
    await expect(
      kid().goals.create({ title: 'Goal 4', targetCents: 1000, term: 'short', category: 'thing' }),
    ).rejects.toThrow(/at most 3/i);
    expect(await kid().goals.listByChild({ childId: kidId })).toHaveLength(3);
  });

  it('contributes toward a goal, capping at the target and stamping achievedAt', async () => {
    if (!dbAvailable) return;
    const goal = await kid().goals.create({
      title: 'Console',
      targetCents: 1000,
      term: 'long',
      category: 'thing',
    });

    const partial = await kid().goals.contribute({ goalId: goal.id, amountCents: 600 });
    expect(partial.savedCents).toBe(600);
    expect(partial.achievedAt).toBeUndefined();

    // Over-contributing caps at the target and marks the goal achieved.
    const done = await kid().goals.contribute({ goalId: goal.id, amountCents: 999 });
    expect(done.savedCents).toBe(1000);
    expect(typeof done.achievedAt).toBe('string');
  });

  it('deletes a goal and rejects deleting an unknown one', async () => {
    if (!dbAvailable) return;
    const goal = await kid().goals.create({
      title: 'Temp',
      targetCents: 5000,
      term: 'short',
      category: 'learn',
    });
    expect(await kid().goals.delete({ goalId: goal.id })).toEqual({ ok: true });
    expect(await kid().goals.listByChild({ childId: kidId })).toHaveLength(0);

    await expect(kid().goals.delete({ goalId: 'does-not-exist' })).rejects.toThrow(/not found/i);
  });

  it('rejects invalid create input (Zod) and parent-role creation', async () => {
    if (!dbAvailable) return;
    // Empty title and a non-positive target are rejected by the router schema.
    await expect(
      kid().goals.create({ title: '', targetCents: 100, term: 'short', category: 'thing' }),
    ).rejects.toThrow();
    await expect(
      kid().goals.create({ title: 'x', targetCents: 0, term: 'short', category: 'thing' }),
    ).rejects.toThrow();
    await expect(
      // @ts-expect-error invalid term value is rejected by the schema
      kid().goals.create({ title: 'x', targetCents: 100, term: 'soon', category: 'thing' }),
    ).rejects.toThrow();

    // goals.create is a childProcedure — a parent token can't call it.
    await expect(
      caller(parentClaims).goals.create({
        title: 'x',
        targetCents: 100,
        term: 'short',
        category: 'thing',
      }),
    ).rejects.toThrow();

    // No invalid goal slipped through.
    expect(await kid().goals.listByChild({ childId: kidId })).toHaveLength(0);
  });
});
