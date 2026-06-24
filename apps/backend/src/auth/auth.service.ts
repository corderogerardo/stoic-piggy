import { Injectable } from '@nestjs/common';
import type {
  AuthChild,
  AuthParent,
  AuthSession,
  AuthUser,
  ChildHome,
  CreateChildAccountInput,
  LoginChildInput,
  LoginParentInput,
  RegisterParentInput,
} from '@stoicpiggy/shared';
import { TRPCError } from '@trpc/server';
import { PrismaService } from '../prisma/prisma.service';
import { type AuthClaims, signToken, verifyToken } from './jwt';
import { hashPassword, verifyPassword } from './password';

@Injectable()
export class AuthService {
  private readonly secret: string;

  constructor(private readonly prisma: PrismaService) {
    this.secret = resolveJwtSecret();
  }

  /** Verify a bearer token and return its claims (or null). Used by the tRPC context. */
  verify(token: string): AuthClaims | null {
    return verifyToken(token, this.secret);
  }

  // ---- Parents ----

  async registerParent(input: RegisterParentInput): Promise<AuthSession> {
    const existing = await this.prisma.parent.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new TRPCError({ code: 'CONFLICT', message: 'That email is already registered.' });
    }
    const parent = await this.prisma.parent.create({
      data: {
        email: input.email,
        displayName: input.displayName,
        passwordHash: await hashPassword(input.password),
      },
    });
    const user: AuthParent = {
      role: 'parent',
      id: parent.id,
      email: parent.email,
      displayName: parent.displayName,
    };
    return { token: this.sign({ sub: parent.id, role: 'parent' }), user };
  }

  async loginParent(input: LoginParentInput): Promise<AuthSession> {
    const parent = await this.prisma.parent.findUnique({ where: { email: input.email } });
    if (!parent || !(await verifyPassword(input.password, parent.passwordHash))) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Wrong email or password.' });
    }
    const user: AuthParent = {
      role: 'parent',
      id: parent.id,
      email: parent.email,
      displayName: parent.displayName,
    };
    return { token: this.sign({ sub: parent.id, role: 'parent' }), user };
  }

  // ---- Kids ----

  async loginChild(input: LoginChildInput): Promise<AuthSession> {
    const child = await this.prisma.child.findUnique({ where: { username: input.username } });
    if (!child || !(await verifyPassword(input.password, child.passwordHash))) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Wrong username or password.' });
    }
    return { token: this.sign(this.childClaims(child)), user: this.toAuthChild(child) };
  }

  /** A parent creates a kid account (+ a default piggy bank). Returns the created child row. */
  async createChild(parentId: string, input: CreateChildAccountInput) {
    try {
      return await this.prisma.child.create({
        data: {
          parentId,
          displayName: input.displayName,
          username: input.username,
          passwordHash: await hashPassword(input.password),
          age: input.age,
          avatarUrl: input.avatarUrl,
          piggyBanks: { create: { name: 'Ahorros' } },
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new TRPCError({ code: 'CONFLICT', message: 'That username is already taken.' });
      }
      throw error;
    }
  }

  // ---- Shared ----

  /** Resolve the current user for the `auth.me` query. */
  async me(claims: AuthClaims): Promise<AuthUser> {
    if (claims.role === 'parent') {
      const parent = await this.prisma.parent.findUnique({ where: { id: claims.sub } });
      if (!parent)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Account no longer exists.' });
      return {
        role: 'parent',
        id: parent.id,
        email: parent.email,
        displayName: parent.displayName,
      };
    }
    const child = await this.prisma.child.findUnique({ where: { id: claims.sub } });
    if (!child) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Account no longer exists.' });
    return this.toAuthChild(child);
  }

  /** Aggregated home payload for a signed-in kid. */
  async childHome(childId: string): Promise<ChildHome> {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
      include: {
        piggyBanks: true,
        goals: { orderBy: { createdAt: 'asc' }, take: 1 },
        quests: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!child) throw new TRPCError({ code: 'NOT_FOUND', message: 'Child not found.' });

    const goal = child.goals[0];
    return {
      child: {
        ...this.toAuthChild(child),
        level: child.level,
        xp: child.xp,
        avatarUrl: child.avatarUrl ?? undefined,
      },
      balanceCents: child.piggyBanks.reduce((sum, b) => sum + b.balanceCents, 0),
      goal: goal
        ? { title: goal.title, targetCents: goal.targetCents, savedCents: goal.savedCents }
        : undefined,
      quests: child.quests.map((q) => ({
        id: q.id,
        childId: q.childId,
        title: q.title,
        description: q.description,
        rewardXp: q.rewardXp,
        rewardCents: q.rewardCents,
        status: q.status,
        createdAt: q.createdAt.toISOString(),
        updatedAt: q.updatedAt.toISOString(),
      })),
    };
  }

  private sign(claims: AuthClaims): string {
    return signToken(claims, this.secret);
  }

  private childClaims(child: { id: string; parentId: string }): AuthClaims {
    return { sub: child.id, role: 'child', parentId: child.parentId };
  }

  private toAuthChild(child: {
    id: string;
    parentId: string;
    username: string;
    displayName: string;
  }): AuthChild {
    return {
      role: 'child',
      id: child.id,
      parentId: child.parentId,
      username: child.username,
      displayName: child.displayName,
    };
  }
}

/**
 * Resolve the JWT signing secret, failing CLOSED. A token signed with a
 * predictable secret can be forged, so we only allow an ephemeral dev secret
 * when NODE_ENV is explicitly `development` or `test`. On any other environment
 * (production, staging, preview, or an unset NODE_ENV) a real `JWT_SECRET` is
 * required — we never fall back to a committed constant on a traffic-serving path.
 */
function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length > 0) return secret;

  const env = process.env.NODE_ENV;
  if (env === 'development' || env === 'test') {
    console.warn('[AuthService] JWT_SECRET is not set — using an insecure dev-only secret.');
    return 'dev-secret-change-me';
  }
  throw new Error('JWT_SECRET must be set (no insecure fallback outside development/test).');
}

/** Prisma throws P2002 on a unique-constraint violation (e.g. duplicate username). */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}
