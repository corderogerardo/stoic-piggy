process.env.DATABASE_URL ??= 'postgresql://user:password@localhost:5432/stoicpiggy';
process.env.DIRECT_URL ??= process.env.DATABASE_URL;
process.env.JWT_SECRET ??= 'e2e-secret';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import request from 'supertest';
import { AuthService } from '../src/auth/auth.service';
import type { AuthClaims } from '../src/auth/jwt';
import { FamilyService } from '../src/family/family.service';
import { PiggyService } from '../src/piggy/piggy.service';
import { TrpcModule } from '../src/trpc/trpc.module';
import { TrpcRouter } from '../src/trpc/trpc.router';

// Stub the whole data layer so the tRPC HTTP surface (routing + auth gating) can
// be exercised without a database. The auth stub controls token → claims.
const familyStub: Pick<
  FamilyService,
  'listChildren' | 'listGoals' | 'listQuests' | 'dashboardByParent' | 'childParentId'
> = {
  listChildren: async () => [],
  listGoals: async () => [],
  listQuests: async () => [],
  childParentId: async () => 'p1',
  dashboardByParent: async () => [
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
    },
  ],
};

const piggyStub: Pick<PiggyService, 'listPiggyBanks' | 'createTransaction' | 'piggyBankChildId'> = {
  listPiggyBanks: async () => [],
  piggyBankChildId: async () => 'c1',
  createTransaction: async () => {
    throw new Error('not exercised');
  },
};

const authStub: Pick<
  AuthService,
  | 'verify'
  | 'registerParent'
  | 'loginParent'
  | 'loginChild'
  | 'verifyEmail'
  | 'resendVerification'
  | 'requestPasswordReset'
  | 'resetPassword'
  | 'me'
  | 'createChild'
  | 'childHome'
> = {
  verify: (token: string): AuthClaims | null => {
    if (token === 'parent-token') return { sub: 'p1', role: 'parent' };
    if (token === 'child-token') return { sub: 'c1', role: 'child', parentId: 'p1' };
    return null;
  },
  registerParent: async (input) => ({
    token: 'parent-token',
    user: {
      role: 'parent',
      id: 'p1',
      email: input.email,
      displayName: input.displayName,
      emailVerifiedAt: null,
    },
  }),
  loginParent: async () => ({
    token: 'parent-token',
    user: {
      role: 'parent',
      id: 'p1',
      email: 'p@x.dev',
      displayName: 'Patricia',
      emailVerifiedAt: null,
    },
  }),
  loginChild: async (input) => ({
    token: 'child-token',
    user: {
      role: 'child',
      id: 'c1',
      parentId: 'p1',
      username: input.username,
      displayName: 'Marco',
    },
  }),
  verifyEmail: async () => ({
    token: 'parent-token',
    user: {
      role: 'parent',
      id: 'p1',
      email: 'p@x.dev',
      displayName: 'Patricia',
      emailVerifiedAt: '2026-06-24T00:00:00.000Z',
    },
  }),
  resendVerification: async () => ({ ok: true }),
  requestPasswordReset: async () => ({ ok: true }),
  resetPassword: async () => ({ ok: true }),
  me: async (claims) =>
    claims.role === 'parent'
      ? {
          role: 'parent',
          id: 'p1',
          email: 'p@x.dev',
          displayName: 'Patricia',
          emailVerifiedAt: null,
        }
      : { role: 'child', id: 'c1', parentId: 'p1', username: 'marco', displayName: 'Marco' },
  createChild: async () => {
    throw new Error('not exercised');
  },
  childHome: async () => ({
    child: {
      role: 'child',
      id: 'c1',
      parentId: 'p1',
      username: 'marco',
      displayName: 'Marco',
      level: 7,
      xp: 1240,
    },
    balanceCents: 34000,
    goal: { title: 'Bici', targetCents: 50000, savedCents: 34000 },
    quests: [],
  }),
};

describe('tRPC (e2e, stubbed)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [TrpcModule] })
      .overrideProvider(FamilyService)
      .useValue(familyStub)
      .overrideProvider(PiggyService)
      .useValue(piggyStub)
      .overrideProvider(AuthService)
      .useValue(authStub)
      .compile();

    app = moduleRef.createNestApplication();
    const trpc = app.get(TrpcRouter);
    app.use(
      '/trpc',
      createExpressMiddleware({ router: trpc.appRouter, createContext: trpc.createContext }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const get = (path: string, token?: string) => {
    const req = request(app.getHttpServer()).get(path);
    return token ? req.set('authorization', `Bearer ${token}`) : req;
  };

  it('GET /trpc/health -> ok (public)', async () => {
    const res = await get('/trpc/health');
    expect(res.status).toBe(200);
    expect(res.body.result.data.json.status).toBe('ok');
  });

  it('rejects an unauthenticated dashboard request with 401', async () => {
    const res = await get('/trpc/children.dashboard');
    expect(res.status).toBe(401);
  });

  it('returns dashboard rows for a parent token', async () => {
    const res = await get('/trpc/children.dashboard', 'parent-token');
    expect(res.status).toBe(200);
    expect(res.body.result.data.json[0].balanceCents).toBe(34000);
  });

  it('returns home for a child token', async () => {
    const res = await get('/trpc/me.home', 'child-token');
    expect(res.status).toBe(200);
    expect(res.body.result.data.json.balanceCents).toBe(34000);
  });

  it('forbids a parent from the kid home (403)', async () => {
    const res = await get('/trpc/me.home', 'parent-token');
    expect(res.status).toBe(403);
  });

  it('forbids a child from the parent dashboard (403)', async () => {
    const res = await get('/trpc/children.dashboard', 'child-token');
    expect(res.status).toBe(403);
  });

  it('registers a parent over POST', async () => {
    const res = await request(app.getHttpServer())
      .post('/trpc/auth.registerParent')
      .send({ json: { email: 'new@x.dev', password: 'password123', displayName: 'New' } });
    expect(res.status).toBe(200);
    expect(res.body.result.data.json.token).toBe('parent-token');
    expect(res.body.result.data.json.user.role).toBe('parent');
  });
});
