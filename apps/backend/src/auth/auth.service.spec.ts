import { Logger } from '@nestjs/common';
import type { MailService } from '../mail/mail.service';
import type { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { verifyToken } from './jwt';
import { hashPassword } from './password';
import { hashToken } from './tokens';

type FakePrisma = {
  parent: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
  child: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
  emailVerificationToken: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
  passwordResetToken: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
};

function makePrisma(): FakePrisma {
  return {
    parent: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    child: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    emailVerificationToken: {
      create: jest.fn().mockResolvedValue({ id: 'evt1' }),
      findUnique: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({ id: 'evt1' }),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    passwordResetToken: {
      create: jest.fn().mockResolvedValue({ id: 'prt1' }),
      findUnique: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({ id: 'prt1' }),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
  };
}

type FakeMail = { sendVerificationEmail: jest.Mock; sendPasswordResetEmail: jest.Mock };
function makeMail(): FakeMail {
  return { sendVerificationEmail: jest.fn(), sendPasswordResetEmail: jest.fn() };
}

const SECRET = 'unit-test-secret';
let prisma: FakePrisma;
let mail: FakeMail;
let service: AuthService;

beforeEach(() => {
  process.env.JWT_SECRET = SECRET;
  delete process.env.APP_URL;
  prisma = makePrisma();
  mail = makeMail();
  service = new AuthService(prisma as unknown as PrismaService, mail as unknown as MailService);
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
      emailVerifiedAt: null,
    });
    expect(verifyToken(session.token, SECRET)).toMatchObject({ sub: 'p1', role: 'parent' });
    // The stored hash must not be the plaintext password.
    const created = prisma.parent.create.mock.calls[0][0].data;
    expect(created.passwordHash).not.toBe('password123');
    // A verification token is minted and emailed with a clickable link.
    expect(prisma.emailVerificationToken.create).toHaveBeenCalledTimes(1);
    expect(mail.sendVerificationEmail).toHaveBeenCalledTimes(1);
    const [to, link] = mail.sendVerificationEmail.mock.calls[0];
    expect(to).toBe('a@b.dev');
    expect(link).toMatch(/\/verify-email\?token=/);
    // The emailed link's token is stored only as a hash, never raw.
    const rawToken = new URL(link).searchParams.get('token') as string;
    expect(prisma.emailVerificationToken.create.mock.calls[0][0].data.tokenHash).toBe(
      hashToken(rawToken),
    );
  });

  it('rejects a duplicate email', async () => {
    prisma.parent.findUnique.mockResolvedValue({ id: 'p1' });
    await expect(
      service.registerParent({ email: 'a@b.dev', password: 'password123', displayName: 'Ann' }),
    ).rejects.toThrow(/already registered/i);
  });

  it('still succeeds if the verification email fails to send', async () => {
    prisma.parent.findUnique.mockResolvedValue(null);
    prisma.parent.create.mockResolvedValue({ id: 'p1', email: 'a@b.dev', displayName: 'Ann' });
    mail.sendVerificationEmail.mockRejectedValue(new Error('resend down'));
    // The failure is logged (best-effort) — silence it to keep test output clean.
    const errorLog = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    const session = await service.registerParent({
      email: 'a@b.dev',
      password: 'password123',
      displayName: 'Ann',
    });
    expect(session.user.role).toBe('parent');
    expect(errorLog).toHaveBeenCalled();
    errorLog.mockRestore();
  });
});

describe('AuthService APP_URL guard', () => {
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
    delete process.env.APP_URL;
  });

  function construct(): void {
    new AuthService(prisma as unknown as PrismaService, mail as unknown as MailService);
  }

  it('logs an error at boot in production when APP_URL is unset', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.APP_URL;
    const errorLog = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    construct();
    expect(errorLog).toHaveBeenCalledWith(expect.stringMatching(/APP_URL is not set/i));
    errorLog.mockRestore();
  });

  it('stays quiet in production when APP_URL is set', () => {
    process.env.NODE_ENV = 'production';
    process.env.APP_URL = 'https://stoic-piggy-parents.noofficelocation.com';
    const errorLog = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    construct();
    expect(errorLog).not.toHaveBeenCalled();
    errorLog.mockRestore();
  });

  it('stays quiet outside production even when APP_URL is unset', () => {
    process.env.NODE_ENV = 'test';
    delete process.env.APP_URL;
    const errorLog = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    construct();
    expect(errorLog).not.toHaveBeenCalled();
    errorLog.mockRestore();
  });
});

describe('AuthService.verifyEmail', () => {
  it('marks the parent verified, consumes the token, and signs them in', async () => {
    const raw = 'raw-token';
    prisma.emailVerificationToken.findUnique.mockResolvedValue({
      id: 'evt1',
      parentId: 'p1',
      consumedAt: null,
      expiresAt: new Date(Date.now() + 1000),
      parent: { id: 'p1', email: 'a@b.dev', displayName: 'Ann', emailVerifiedAt: null },
    });
    prisma.parent.update.mockResolvedValue({
      id: 'p1',
      email: 'a@b.dev',
      displayName: 'Ann',
      emailVerifiedAt: new Date('2026-06-24T00:00:00.000Z'),
    });

    const session = await service.verifyEmail({ token: raw });

    // Looked up by hash, not the raw token.
    expect(prisma.emailVerificationToken.findUnique.mock.calls[0][0].where.tokenHash).toBe(
      hashToken(raw),
    );
    expect(prisma.emailVerificationToken.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ consumedAt: expect.any(Date) }) }),
    );
    expect(session.user.role).toBe('parent');
    if (session.user.role === 'parent') expect(session.user.emailVerifiedAt).not.toBeNull();
  });

  it('rejects an unknown, expired, or already-consumed token', async () => {
    prisma.emailVerificationToken.findUnique.mockResolvedValue(null);
    await expect(service.verifyEmail({ token: 'nope' })).rejects.toThrow(/invalid or has expired/i);

    prisma.emailVerificationToken.findUnique.mockResolvedValue({
      id: 'evt1',
      parentId: 'p1',
      consumedAt: null,
      expiresAt: new Date(Date.now() - 1000),
      parent: { id: 'p1', emailVerifiedAt: null },
    });
    await expect(service.verifyEmail({ token: 'old' })).rejects.toThrow(/invalid or has expired/i);

    prisma.emailVerificationToken.findUnique.mockResolvedValue({
      id: 'evt1',
      parentId: 'p1',
      consumedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000),
      parent: { id: 'p1', emailVerifiedAt: null },
    });
    await expect(service.verifyEmail({ token: 'used' })).rejects.toThrow(/invalid or has expired/i);
  });
});

describe('AuthService.resendVerification', () => {
  it('invalidates old tokens and sends a fresh email', async () => {
    prisma.parent.findUnique.mockResolvedValue({
      id: 'p1',
      email: 'a@b.dev',
      emailVerifiedAt: null,
    });
    prisma.emailVerificationToken.findFirst.mockResolvedValue(null); // not throttled

    const res = await service.resendVerification('p1');

    expect(res).toEqual({ ok: true });
    expect(prisma.emailVerificationToken.updateMany).toHaveBeenCalledTimes(1);
    expect(mail.sendVerificationEmail).toHaveBeenCalledTimes(1);
  });

  it('is a no-op for an already-verified parent', async () => {
    prisma.parent.findUnique.mockResolvedValue({
      id: 'p1',
      email: 'a@b.dev',
      emailVerifiedAt: new Date(),
    });
    const res = await service.resendVerification('p1');
    expect(res).toEqual({ ok: true });
    expect(mail.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it('throttles back-to-back resends', async () => {
    prisma.parent.findUnique.mockResolvedValue({
      id: 'p1',
      email: 'a@b.dev',
      emailVerifiedAt: null,
    });
    prisma.emailVerificationToken.findFirst.mockResolvedValue({ id: 'recent' }); // a recent token
    await expect(service.resendVerification('p1')).rejects.toThrow(/wait a moment/i);
    expect(mail.sendVerificationEmail).not.toHaveBeenCalled();
  });
});

describe('AuthService.requestPasswordReset', () => {
  it('mints + emails a reset link for a known account', async () => {
    prisma.parent.findUnique.mockResolvedValue({ id: 'p1', email: 'a@b.dev' });
    prisma.passwordResetToken.findFirst.mockResolvedValue(null); // not throttled

    const res = await service.requestPasswordReset({ email: 'a@b.dev' });

    expect(res).toEqual({ ok: true });
    expect(prisma.passwordResetToken.create).toHaveBeenCalledTimes(1);
    expect(mail.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    const [, link] = mail.sendPasswordResetEmail.mock.calls[0];
    expect(link).toMatch(/\/reset-password\?token=/);
    const raw = new URL(link).searchParams.get('token') as string;
    expect(prisma.passwordResetToken.create.mock.calls[0][0].data.tokenHash).toBe(hashToken(raw));
  });

  it('returns ok without sending for an unknown email (no enumeration)', async () => {
    prisma.parent.findUnique.mockResolvedValue(null);
    const res = await service.requestPasswordReset({ email: 'ghost@b.dev' });
    expect(res).toEqual({ ok: true });
    expect(mail.sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it('silently throttles a rapid second request', async () => {
    prisma.parent.findUnique.mockResolvedValue({ id: 'p1', email: 'a@b.dev' });
    prisma.passwordResetToken.findFirst.mockResolvedValue({ id: 'recent' });
    const res = await service.requestPasswordReset({ email: 'a@b.dev' });
    expect(res).toEqual({ ok: true });
    expect(mail.sendPasswordResetEmail).not.toHaveBeenCalled();
  });
});

describe('AuthService.resetPassword', () => {
  it('sets a new password hash, consumes the token, and invalidates the rest', async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 'prt1',
      parentId: 'p1',
      consumedAt: null,
      expiresAt: new Date(Date.now() + 1000),
    });

    const res = await service.resetPassword({ token: 'raw', password: 'newpassword123' });

    expect(res).toEqual({ ok: true });
    const updateArg = prisma.parent.update.mock.calls[0][0];
    expect(updateArg.where).toEqual({ id: 'p1' });
    expect(updateArg.data.passwordHash).not.toBe('newpassword123');
    expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ parentId: 'p1', consumedAt: null }),
      }),
    );
  });

  it('rejects an unknown, expired, or already-used token', async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValue(null);
    await expect(service.resetPassword({ token: 'x', password: 'newpassword123' })).rejects.toThrow(
      /invalid or has expired/i,
    );

    prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 'prt1',
      parentId: 'p1',
      consumedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000),
    });
    await expect(
      service.resetPassword({ token: 'used', password: 'newpassword123' }),
    ).rejects.toThrow(/invalid or has expired/i);
  });
});

describe('AuthService.loginParent', () => {
  it('accepts a correct password and surfaces the unverified state', async () => {
    prisma.parent.findUnique.mockResolvedValue({
      id: 'p1',
      email: 'a@b.dev',
      displayName: 'Ann',
      passwordHash: await hashPassword('password123'),
      emailVerifiedAt: null,
    });
    const session = await service.loginParent({ email: 'a@b.dev', password: 'password123' });
    expect(session.user.role).toBe('parent');
    if (session.user.role === 'parent') expect(session.user.emailVerifiedAt).toBeNull();
  });

  it('surfaces a verified email as an ISO timestamp', async () => {
    prisma.parent.findUnique.mockResolvedValue({
      id: 'p1',
      email: 'a@b.dev',
      displayName: 'Ann',
      passwordHash: await hashPassword('password123'),
      emailVerifiedAt: new Date('2026-06-24T12:00:00.000Z'),
    });
    const session = await service.loginParent({ email: 'a@b.dev', password: 'password123' });
    if (session.user.role === 'parent') {
      expect(session.user.emailVerifiedAt).toBe('2026-06-24T12:00:00.000Z');
    }
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

  it('rejects a deactivated kid even with the right password', async () => {
    prisma.child.findUnique.mockResolvedValue({
      id: 'c1',
      parentId: 'p1',
      username: 'marco',
      displayName: 'Marco',
      passwordHash: await hashPassword('piggy1234'),
      deactivatedAt: new Date(),
    });
    await expect(service.loginChild({ username: 'marco', password: 'piggy1234' })).rejects.toThrow(
      /deactivated/i,
    );
  });
});

describe('AuthService.resetChildPassword', () => {
  it('writes a new hash (not the plaintext) for the given child', async () => {
    prisma.child.update.mockResolvedValue({ id: 'c1' });
    await service.resetChildPassword({ childId: 'c1', password: 'newpassword123' });
    const arg = prisma.child.update.mock.calls[0][0];
    expect(arg.where.id).toBe('c1');
    expect(arg.data.passwordHash).not.toBe('newpassword123');
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
      xp: 6500, // 6500 XP → level 7 (Expert) under 1000 XP/level
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
