process.env.JWT_SECRET ??= 'integration-secret';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import type { AuthClaims } from '../src/auth/jwt';
import { PrismaService } from '../src/prisma/prisma.service';
import type { AppRouter } from '../src/trpc/app.router';
import type { TrpcContext } from '../src/trpc/trpc.context';
import { TrpcRouter } from '../src/trpc/trpc.router';

// Full auth flow against a REAL Postgres (provided by CI's service container or
// the local docker-compose db). If no database is reachable the suite no-ops so
// `test:e2e` stays green for devs without a DB — CI always has one.
describe('auth flow (e2e, real Postgres)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let auth: AuthService;
  let appRouter: AppRouter;
  let dbAvailable = false;

  const stamp = Date.now();
  const email = `parent-${stamp}@e2e.dev`;
  const username = `kid${stamp}`;
  const password = 'password123';

  const ctx = (user: AuthClaims | null): TrpcContext => ({ token: user ? 'tok' : null, user });
  const caller = (user: AuthClaims | null) => appRouter.createCaller(ctx(user));

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    auth = app.get(AuthService);
    appRouter = app.get(TrpcRouter).appRouter;

    // When REQUIRE_DB=1 (CI), a missing/non-local DB is a hard failure so a
    // broken Postgres service can never turn the job green by silently skipping.
    const requireDb = process.env.REQUIRE_DB === '1';

    // SAFETY: only ever run this destructive flow against a local/CI database,
    // never the production Supabase instance, even if .env points there.
    const url = process.env.DATABASE_URL ?? '';
    const isLocal = /localhost|127\.0\.0\.1|@db:/.test(url);
    if (!isLocal) {
      if (requireDb) {
        throw new Error(
          `[auth.db.e2e] REQUIRE_DB=1 but DATABASE_URL is not local: "${url}". Refusing to run.`,
        );
      }
      // eslint-disable-next-line no-console
      console.warn('[auth.db.e2e] DATABASE_URL is not local — skipping integration assertions.');
      return;
    }

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbAvailable = true;
    } catch (error) {
      if (requireDb) throw error;
      // eslint-disable-next-line no-console
      console.warn('[auth.db.e2e] No database reachable — skipping integration assertions.');
    }
  });

  afterAll(async () => {
    if (dbAvailable) {
      await prisma.parent.deleteMany({ where: { email } }).catch(() => undefined);
    }
    await app?.close();
  });

  it('registers a parent, creates a kid, and the kid signs in', async () => {
    if (!dbAvailable) return;
    const anon = caller(null);

    // 1. Parent registers.
    const parentSession = await anon.auth.registerParent({
      email,
      password,
      displayName: 'E2E Parent',
    });
    expect(parentSession.user.role).toBe('parent');
    const parentClaims = auth.verify(parentSession.token);
    expect(parentClaims).toMatchObject({ role: 'parent' });
    const parent = caller(parentClaims);

    // 2. auth.me resolves the parent.
    const me = await parent.auth.me();
    expect(me.role).toBe('parent');
    if (me.role === 'parent') expect(me.email).toBe(email);

    // 3. Parent creates a kid account (+ starter piggy bank).
    const kid = await parent.children.create({ displayName: 'E2E Kid', username, password });
    expect(kid.displayName).toBe('E2E Kid');

    // 4. The new kid shows up on the parent dashboard with a zero balance.
    const dashboard = await parent.children.dashboard();
    const row = dashboard.find((d) => d.id === kid.id);
    expect(row).toBeDefined();
    expect(row?.balanceCents).toBe(0);

    // 5. The kid signs in by username.
    const kidSession = await anon.auth.loginChild({ username, password });
    expect(kidSession.user.role).toBe('child');
    const kidClaims = auth.verify(kidSession.token);
    const child = caller(kidClaims);

    // 6. The kid sees their own home (starter bank → $0, no goal yet).
    const home = await child.me.home();
    expect(home.child.id).toBe(kid.id);
    expect(home.balanceCents).toBe(0);

    // 7. The kid can read their own piggy bank…
    const banks = await child.piggy.listByChild({ childId: kid.id });
    expect(banks.map((b) => b.name)).toContain('Ahorros');

    // 8. …but not someone else's.
    await expect(child.piggy.listByChild({ childId: 'someone-else' })).rejects.toThrow(/not your/i);
  });

  it('rejects anonymous access and duplicate credentials', async () => {
    if (!dbAvailable) return;
    const anon = caller(null);

    await expect(anon.children.dashboard()).rejects.toThrow();
    await expect(anon.auth.registerParent({ email, password, displayName: 'Dup' })).rejects.toThrow(
      /already registered/i,
    );
    await expect(anon.auth.loginParent({ email, password: 'wrongpass' })).rejects.toThrow();
  });
});
