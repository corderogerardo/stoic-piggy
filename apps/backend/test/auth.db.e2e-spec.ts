process.env.JWT_SECRET ??= 'integration-secret';
process.env.APP_URL ??= 'http://localhost:3002';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import type { AuthClaims } from '../src/auth/jwt';
import { MAIL_TRANSPORT, type MailMessage, type MailTransport } from '../src/mail/mail.service';
import { PrismaService } from '../src/prisma/prisma.service';
import type { AppRouter } from '../src/trpc/app.router';
import type { TrpcContext } from '../src/trpc/trpc.context';
import { TrpcRouter } from '../src/trpc/trpc.router';

// Capture outbound email instead of sending it, so the test can read the link.
const sentEmails: MailMessage[] = [];
const captureTransport: MailTransport = {
  async send(message) {
    sentEmails.push(message);
  },
};
const linkFor = (to: string, path: string): string => {
  const msg = [...sentEmails].reverse().find((m) => m.to === to && m.text.includes(path));
  const match = msg?.text.match(new RegExp(`https?://\\S*${path}\\S*`));
  if (!match) throw new Error(`No ${path} email captured for ${to}`);
  return match[0];
};
const tokenFrom = (link: string): string => new URL(link).searchParams.get('token') ?? '';

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
  const verifyEmailAddr = `verify-${stamp}@e2e.dev`;
  const resetEmailAddr = `reset-${stamp}@e2e.dev`;
  const username = `kid${stamp}`;
  const password = 'password123';

  const ctx = (user: AuthClaims | null): TrpcContext => ({ token: user ? 'tok' : null, user });
  const caller = (user: AuthClaims | null) => appRouter.createCaller(ctx(user));

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MAIL_TRANSPORT)
      .useValue(captureTransport)
      .compile();
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
      await prisma.parent
        .deleteMany({ where: { email: { in: [email, verifyEmailAddr, resetEmailAddr] } } })
        .catch(() => undefined);
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

  it('verifies a parent email via the emailed link, single-use', async () => {
    if (!dbAvailable) return;
    const anon = caller(null);

    // Register → starts unverified, and a verification email is captured.
    const session = await anon.auth.registerParent({
      email: verifyEmailAddr,
      password,
      displayName: 'Verify Me',
    });
    if (session.user.role === 'parent') expect(session.user.emailVerifiedAt).toBeNull();

    // me() (before verifying) still reports unverified.
    const before = await caller(auth.verify(session.token)).auth.me();
    if (before.role === 'parent') expect(before.emailVerifiedAt).toBeNull();

    // Pull the token out of the captured email link and redeem it.
    const token = tokenFrom(linkFor(verifyEmailAddr, '/verify-email'));
    expect(token.length).toBeGreaterThan(10);
    const verified = await anon.auth.verifyEmail({ token });
    if (verified.user.role === 'parent') expect(verified.user.emailVerifiedAt).not.toBeNull();

    // me() now reports verified.
    const after = await caller(auth.verify(verified.token)).auth.me();
    if (after.role === 'parent') expect(after.emailVerifiedAt).not.toBeNull();

    // Logging in afterwards also surfaces the verified state.
    const relogin = await anon.auth.loginParent({ email: verifyEmailAddr, password });
    if (relogin.user.role === 'parent') expect(relogin.user.emailVerifiedAt).not.toBeNull();

    // The link is single-use: redeeming the same token again fails.
    await expect(anon.auth.verifyEmail({ token })).rejects.toThrow(/invalid or has expired/i);
  });

  it('resets a forgotten password via the emailed link', async () => {
    if (!dbAvailable) return;
    const anon = caller(null);
    const newPassword = 'brand-new-pass-456';

    // A parent exists.
    await anon.auth.registerParent({ email: resetEmailAddr, password, displayName: 'Reset Me' });

    // Request a reset → always ok, and (since the account exists) an email is captured.
    expect(await anon.auth.requestPasswordReset({ email: resetEmailAddr })).toEqual({ ok: true });
    // Unknown emails also return ok (no enumeration) without queuing an email.
    expect(await anon.auth.requestPasswordReset({ email: `missing-${stamp}@e2e.dev` })).toEqual({
      ok: true,
    });

    // Redeem the reset link.
    const token = tokenFrom(linkFor(resetEmailAddr, '/reset-password'));
    expect(await anon.auth.resetPassword({ token, password: newPassword })).toEqual({ ok: true });

    // The old password no longer works; the new one does.
    await expect(anon.auth.loginParent({ email: resetEmailAddr, password })).rejects.toThrow(
      /wrong email or password/i,
    );
    const session = await anon.auth.loginParent({ email: resetEmailAddr, password: newPassword });
    expect(session.user.role).toBe('parent');

    // The reset link is single-use.
    await expect(anon.auth.resetPassword({ token, password: newPassword })).rejects.toThrow(
      /invalid or has expired/i,
    );
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
