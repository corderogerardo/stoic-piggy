process.env.DATABASE_URL ??= 'postgresql://user:password@localhost:5432/stoicpiggy';
process.env.DIRECT_URL ??= process.env.DATABASE_URL;

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import request from 'supertest';
import { FamilyService } from '../src/family/family.service';
import { PiggyService } from '../src/piggy/piggy.service';
import { TrpcModule } from '../src/trpc/trpc.module';
import { TrpcRouter } from '../src/trpc/trpc.router';

// Stub the data layer so the tRPC HTTP surface can be exercised without a database.
const familyStub: Pick<FamilyService, 'listChildren' | 'listGoals' | 'listQuests' | 'dashboardByParent'> = {
  listChildren: async () => [],
  listGoals: async () => [],
  listQuests: async () => [],
  dashboardByParent: async () => [
    { id: 'c1', displayName: 'Marco', avatarUrl: null, age: 12, level: 7, xp: 1240, balanceCents: 34000, allowanceCents: 5000, autopayEnabled: true, goal: { title: 'Bici', targetCents: 50000, savedCents: 34000 } },
  ],
};
const piggyStub: Pick<PiggyService, 'listPiggyBanks' | 'createTransaction'> = {
  listPiggyBanks: async () => [],
  createTransaction: async () => {
    throw new Error('not exercised');
  },
};

describe('tRPC (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [TrpcModule] })
      .overrideProvider(FamilyService)
      .useValue(familyStub)
      .overrideProvider(PiggyService)
      .useValue(piggyStub)
      .compile();

    app = moduleRef.createNestApplication();
    const trpc = app.get(TrpcRouter);
    app.use('/trpc', createExpressMiddleware({ router: trpc.appRouter, createContext: trpc.createContext }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /trpc/health -> ok', async () => {
    const res = await request(app.getHttpServer()).get('/trpc/health');
    expect(res.status).toBe(200);
    expect(res.body.result.data.json.status).toBe('ok');
  });

  it('GET /trpc/children.dashboardByParent -> aggregated rows', async () => {
    const input = encodeURIComponent(JSON.stringify({ json: { parentId: 'seed-parent' } }));
    const res = await request(app.getHttpServer()).get(`/trpc/children.dashboardByParent?input=${input}`);
    expect(res.status).toBe(200);
    expect(res.body.result.data.json[0].balanceCents).toBe(34000);
    expect(res.body.result.data.json[0].goal.targetCents).toBe(50000);
  });
});
