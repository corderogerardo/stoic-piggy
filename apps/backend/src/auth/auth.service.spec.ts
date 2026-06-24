import type { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { verifyToken } from './jwt';
import { hashPassword } from './password';

type FakePrisma = {
  parent: { findUnique: jest.Mock; create: jest.Mock };
  child: { findUnique: jest.Mock; create: jest.Mock };
};

function makePrisma(): FakePrisma {
  return {
    parent: { findUnique: jest.fn(), create: jest.fn() },
    child: { findUnique: jest.fn(), create: jest.fn() },
  };
}

const SECRET = 'unit-test-secret';
let prisma: FakePrisma;
let service: AuthService;

beforeEach(() => {
  process.env.JWT_SECRET = SECRET;
  prisma = makePrisma();
  service = new AuthService(prisma as unknown as PrismaService);
});

describe('AuthService.registerParent', () => {
  it('creates a parent and returns a verifiable token', async () => {
    prisma.parent.findUnique.mockResolvedValue(null);
    prisma.parent.create.mockResolvedValue({
      id: 'p1',
      email: 'a@b.dev',
      displayName: 'Ann',
      passwordHash: 'x',
    });

    const session = await service.registerParent({
      email: 'a@b.dev',
      password: 'password123',
      displayName: 'Ann',
    });

    expect(session.user).toEqual({
      role: 'parent',
      id: 'p1',
      email: 'a@b.dev',
      displayName: 'Ann',
    });
    expect(verifyToken(session.token, SECRET)).toMatchObject({ sub: 'p1', role: 'parent' });
    // The stored hash must not be the plaintext password.
    const created = prisma.parent.create.mock.calls[0][0].data;
    expect(created.passwordHash).not.toBe('password123');
  });

  it('rejects a duplicate email', async () => {
    prisma.parent.findUnique.mockResolvedValue({ id: 'p1' });
    await expect(
      service.registerParent({ email: 'a@b.dev', password: 'password123', displayName: 'Ann' }),
    ).rejects.toThrow(/already registered/i);
  });
});

describe('AuthService.loginParent', () => {
  it('accepts a correct password', async () => {
    prisma.parent.findUnique.mockResolvedValue({
      id: 'p1',
      email: 'a@b.dev',
      displayName: 'Ann',
      passwordHash: await hashPassword('password123'),
    });
    const session = await service.loginParent({ email: 'a@b.dev', password: 'password123' });
    expect(session.user.role).toBe('parent');
  });

  it('rejects a wrong password', async () => {
    prisma.parent.findUnique.mockResolvedValue({
      id: 'p1',
      email: 'a@b.dev',
      displayName: 'Ann',
      passwordHash: await hashPassword('password123'),
    });
    await expect(service.loginParent({ email: 'a@b.dev', password: 'wrong' })).rejects.toThrow(
      /wrong email or password/i,
    );
  });

  it('rejects an unknown email', async () => {
    prisma.parent.findUnique.mockResolvedValue(null);
    await expect(
      service.loginParent({ email: 'nope@b.dev', password: 'password123' }),
    ).rejects.toThrow(/wrong email or password/i);
  });
});

describe('AuthService.loginChild', () => {
  it('issues a child token with parentId', async () => {
    prisma.child.findUnique.mockResolvedValue({
      id: 'c1',
      parentId: 'p1',
      username: 'marco',
      displayName: 'Marco',
      passwordHash: await hashPassword('piggy1234'),
    });
    const session = await service.loginChild({ username: 'marco', password: 'piggy1234' });
    expect(session.user).toMatchObject({
      role: 'child',
      id: 'c1',
      parentId: 'p1',
      username: 'marco',
    });
    expect(verifyToken(session.token, SECRET)).toMatchObject({
      sub: 'c1',
      role: 'child',
      parentId: 'p1',
    });
  });

  it('rejects a wrong kid password', async () => {
    prisma.child.findUnique.mockResolvedValue({
      id: 'c1',
      parentId: 'p1',
      username: 'marco',
      displayName: 'Marco',
      passwordHash: await hashPassword('piggy1234'),
    });
    await expect(service.loginChild({ username: 'marco', password: 'nope' })).rejects.toThrow(
      /wrong username or password/i,
    );
  });
});

describe('AuthService.createChild', () => {
  it('creates a kid with a starter piggy bank', async () => {
    prisma.child.create.mockResolvedValue({ id: 'c9', parentId: 'p1', displayName: 'Nina' });
    await service.createChild('p1', {
      displayName: 'Nina',
      username: 'nina',
      password: 'password123',
    });

    const arg = prisma.child.create.mock.calls[0][0];
    expect(arg.data.parentId).toBe('p1');
    expect(arg.data.username).toBe('nina');
    expect(arg.data.passwordHash).not.toBe('password123');
    expect(arg.data.piggyBanks.create.name).toBe('Ahorros');
  });

  it('maps a duplicate-username (P2002) to a friendly conflict', async () => {
    prisma.child.create.mockRejectedValue(Object.assign(new Error('dup'), { code: 'P2002' }));
    await expect(
      service.createChild('p1', {
        displayName: 'Nina',
        username: 'taken',
        password: 'password123',
      }),
    ).rejects.toThrow(/username is already taken/i);
  });
});

describe('AuthService.childHome', () => {
  it('aggregates balance, goal and quests', async () => {
    prisma.child.findUnique.mockResolvedValue({
      id: 'c1',
      parentId: 'p1',
      username: 'marco',
      displayName: 'Marco',
      level: 7,
      xp: 1240,
      avatarUrl: null,
      piggyBanks: [{ balanceCents: 20000 }, { balanceCents: 14000 }],
      goals: [{ title: 'Bici', targetCents: 50000, savedCents: 34000 }],
      quests: [
        {
          id: 'q1',
          childId: 'c1',
          title: 'Presupuesto',
          description: 'x',
          rewardXp: 120,
          rewardCents: 0,
          status: 'completed',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
    });

    const home = await service.childHome('c1');
    expect(home.balanceCents).toBe(34000);
    expect(home.goal).toEqual({ title: 'Bici', targetCents: 50000, savedCents: 34000 });
    expect(home.child.level).toBe(7);
    expect(home.quests[0]?.status).toBe('completed');
    expect(typeof home.quests[0]?.createdAt).toBe('string');
  });

  it('throws NOT_FOUND for a missing child', async () => {
    prisma.child.findUnique.mockResolvedValue(null);
    await expect(service.childHome('nope')).rejects.toThrow(/not found/i);
  });
});

describe('AuthService.verify', () => {
  it('verifies tokens it signed and returns null for tampered ones', async () => {
    prisma.parent.findUnique.mockResolvedValue(null);
    prisma.parent.create.mockResolvedValue({
      id: 'p1',
      email: 'a@b.dev',
      displayName: 'Ann',
      passwordHash: 'x',
    });
    const { token } = await service.registerParent({
      email: 'a@b.dev',
      password: 'password123',
      displayName: 'Ann',
    });
    expect(service.verify(token)).toMatchObject({ sub: 'p1', role: 'parent' });
    expect(service.verify(`${token}tampered`)).toBeNull();
  });
});
