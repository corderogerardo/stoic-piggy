import { Injectable, Logger } from '@nestjs/common';
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
  RequestPasswordResetInput,
  ResetChildPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '@stoicpiggy/shared';
import { levelForXp } from '@stoicpiggy/shared';
import { TRPCError } from '@trpc/server';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { type AuthClaims, signToken, verifyToken } from './jwt';
import { hashPassword, verifyPassword } from './password';
import {
  hashToken,
  newToken,
  RESEND_THROTTLE_MS,
  RESET_TTL_MS,
  VERIFICATION_TTL_MS,
} from './tokens';

/** Starter learning missions every new kid begins with (Spanish, matching the app). */
const STARTER_QUESTS = [
  {
    title: 'Aprende a ahorrar',
    description: 'Descubre por qué guardar un poco cada semana hace crecer tu dinero.',
    rewardXp: 50,
    rewardCents: 0,
    lessonKey: 'save',
  },
  {
    title: 'Pon tu primera meta',
    description: 'Elige algo que quieras y define cuánto necesitas ahorrar.',
    rewardXp: 80,
    rewardCents: 0,
    lessonKey: 'goal',
  },
  {
    title: 'Resiste una tentación',
    description: 'Usa el modo tentación y decide NO gastar una vez.',
    rewardXp: 100,
    rewardCents: 0,
    lessonKey: 'resist',
  },
];

@Injectable()
export class AuthService {
  private readonly secret: string;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {
    this.secret = resolveJwtSecret();
    warnIfAppUrlMissing(this.logger);
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
    // Soft gate: send the verification email but never let a mail hiccup fail
    // sign-up — the parent is signed in immediately and can resend from the app.
    await this.sendVerificationEmail(parent);
    return {
      token: this.sign({ sub: parent.id, role: 'parent' }),
      user: this.toAuthParent(parent),
    };
  }

  /** Redeem an email-verification token: mark the parent verified and sign them in. */
  async verifyEmail(input: VerifyEmailInput): Promise<AuthSession> {
    const token = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash: hashToken(input.token) },
      include: { parent: true },
    });
    if (!token || token.consumedAt || token.expiresAt < new Date()) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This verification link is invalid or has expired.',
      });
    }
    // Consume the token (one-shot), then stamp the parent verified, preserving an
    // earlier verification time if they somehow verified before.
    await this.prisma.emailVerificationToken.update({
      where: { id: token.id },
      data: { consumedAt: new Date() },
    });
    const parent = token.parent.emailVerifiedAt
      ? token.parent
      : await this.prisma.parent.update({
          where: { id: token.parentId },
          data: { emailVerifiedAt: new Date() },
        });
    return {
      token: this.sign({ sub: parent.id, role: 'parent' }),
      user: this.toAuthParent(parent),
    };
  }

  /** Re-send the verification email for the signed-in parent (throttled). */
  async resendVerification(parentId: string): Promise<{ ok: true }> {
    const parent = await this.prisma.parent.findUnique({ where: { id: parentId } });
    if (!parent) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Account no longer exists.' });
    }
    if (parent.emailVerifiedAt) return { ok: true }; // already verified — nothing to do

    const recent = await this.prisma.emailVerificationToken.findFirst({
      where: { parentId, createdAt: { gt: new Date(Date.now() - RESEND_THROTTLE_MS) } },
    });
    if (recent) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Please wait a moment before requesting another email.',
      });
    }
    // Invalidate any outstanding tokens so only the newest link works.
    await this.prisma.emailVerificationToken.updateMany({
      where: { parentId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    await this.sendVerificationEmail(parent);
    return { ok: true };
  }

  /** Mint + email a fresh verification link. Best-effort: logs but never throws. */
  private async sendVerificationEmail(parent: { id: string; email: string }): Promise<void> {
    try {
      const { raw, hash } = newToken();
      await this.prisma.emailVerificationToken.create({
        data: {
          parentId: parent.id,
          tokenHash: hash,
          expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
        },
      });
      const link = `${resolveAppUrl()}/verify-email?token=${raw}`;
      await this.mail.sendVerificationEmail(parent.email, link);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${parent.email}`, error as Error);
    }
  }

  async loginParent(input: LoginParentInput): Promise<AuthSession> {
    const parent = await this.prisma.parent.findUnique({ where: { email: input.email } });
    if (!parent || !(await verifyPassword(input.password, parent.passwordHash))) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Wrong email or password.' });
    }
    return {
      token: this.sign({ sub: parent.id, role: 'parent' }),
      user: this.toAuthParent(parent),
    };
  }

  /**
   * Begin a password reset. Always resolves OK regardless of whether the email
   * exists, so an attacker can't enumerate accounts. A reset email is sent only
   * when the parent exists and isn't being throttled.
   */
  async requestPasswordReset(input: RequestPasswordResetInput): Promise<{ ok: true }> {
    const parent = await this.prisma.parent.findUnique({ where: { email: input.email } });
    if (!parent) return { ok: true };

    const recent = await this.prisma.passwordResetToken.findFirst({
      where: { parentId: parent.id, createdAt: { gt: new Date(Date.now() - RESEND_THROTTLE_MS) } },
    });
    if (recent) return { ok: true }; // silently throttle — still no signal to the caller

    await this.sendResetEmail(parent);
    return { ok: true };
  }

  /** Complete a password reset: set the new password and invalidate the token. */
  async resetPassword(input: ResetPasswordInput): Promise<{ ok: true }> {
    const token = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(input.token) },
    });
    if (!token || token.consumedAt || token.expiresAt < new Date()) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This reset link is invalid or has expired.',
      });
    }
    await this.prisma.parent.update({
      where: { id: token.parentId },
      data: { passwordHash: await hashPassword(input.password) },
    });
    // Consume this token and invalidate any other outstanding reset tokens.
    await this.prisma.passwordResetToken.updateMany({
      where: { parentId: token.parentId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    return { ok: true };
  }

  /** Mint + email a fresh password-reset link. Best-effort: logs but never throws. */
  private async sendResetEmail(parent: { id: string; email: string }): Promise<void> {
    try {
      const { raw, hash } = newToken();
      await this.prisma.passwordResetToken.create({
        data: {
          parentId: parent.id,
          tokenHash: hash,
          expiresAt: new Date(Date.now() + RESET_TTL_MS),
        },
      });
      const link = `${resolveAppUrl()}/reset-password?token=${raw}`;
      await this.mail.sendPasswordResetEmail(parent.email, link);
    } catch (error) {
      this.logger.error(`Failed to send password-reset email to ${parent.email}`, error as Error);
    }
  }

  // ---- Kids ----

  async loginChild(input: LoginChildInput): Promise<AuthSession> {
    const child = await this.prisma.child.findUnique({ where: { username: input.username } });
    if (!child || !(await verifyPassword(input.password, child.passwordHash))) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Wrong username or password.' });
    }
    if (child.deactivatedAt) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'This account is deactivated. Ask your parent to turn it back on.',
      });
    }
    return { token: this.sign(this.childClaims(child)), user: this.toAuthChild(child) };
  }

  /** A parent creates a kid account (+ a default piggy bank + starter quests). */
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
          quests: { create: STARTER_QUESTS },
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new TRPCError({ code: 'CONFLICT', message: 'That username is already taken.' });
      }
      throw error;
    }
  }

  /**
   * A parent sets a new password for one of their kids. Ownership is authorized by
   * the router (parentProcedure + authorizeChildAccess) before this is called.
   */
  async resetChildPassword(input: ResetChildPasswordInput): Promise<{ ok: true }> {
    await this.prisma.child.update({
      where: { id: input.childId },
      data: { passwordHash: await hashPassword(input.password) },
    });
    return { ok: true };
  }

  // ---- Account deletion ----

  /**
   * Permanently delete the account holder (parent) and everything below them.
   * The schema's `onDelete: Cascade` removes every Child, PiggyBank, Transaction,
   * SavingsGoal, Quest, Task, ResistedImpulse, and outstanding token. This is the
   * App Store 5.1.1(v) self-serve deletion path, wired from the parents dashboard.
   */
  async deleteAccount(parentId: string): Promise<{ ok: true }> {
    await this.prisma.parent.delete({ where: { id: parentId } });
    return { ok: true };
  }

  /**
   * A signed-in kid asks (from the mobile app) to delete the family account. The
   * kid can't self-delete — the parent owns the account — so this best-effort
   * emails the parent a link to the dashboard's Delete-account flow. Always
   * resolves OK so a mail hiccup never surfaces an error to the child.
   */
  async requestAccountDeletion(childId: string): Promise<{ ok: true }> {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
      include: { parent: true },
    });
    if (!child) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Account no longer exists.' });
    }
    try {
      await this.mail.sendAccountDeletionRequestEmail(
        child.parent.email,
        child.displayName,
        resolveAppUrl(),
      );
    } catch (error) {
      this.logger.error(`Failed to email deletion request for child ${childId}`, error as Error);
    }
    return { ok: true };
  }

  // ---- Shared ----

  /** Resolve the current user for the `auth.me` query. */
  async me(claims: AuthClaims): Promise<AuthUser> {
    if (claims.role === 'parent') {
      const parent = await this.prisma.parent.findUnique({ where: { id: claims.sub } });
      if (!parent)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Account no longer exists.' });
      return this.toAuthParent(parent);
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
        level: levelForXp(child.xp),
        xp: child.xp,
        avatarUrl: child.avatarUrl ?? undefined,
        age: child.age ?? undefined,
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
        lessonKey: q.lessonKey ?? undefined,
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

  private toAuthParent(parent: {
    id: string;
    email: string;
    displayName: string;
    emailVerifiedAt: Date | null;
  }): AuthParent {
    return {
      role: 'parent',
      id: parent.id,
      email: parent.email,
      displayName: parent.displayName,
      emailVerifiedAt: parent.emailVerifiedAt?.toISOString() ?? null,
    };
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

/**
 * Public origin of the parents dashboard, used to build links in emails. Defaults
 * to the local dashboard port so dev/test flows produce a clickable link; set
 * APP_URL in any real deployment so links point at the live dashboard.
 */
function resolveAppUrl(): string {
  const url = process.env.APP_URL;
  return (url && url.length > 0 ? url : 'http://localhost:3002').replace(/\/+$/, '');
}

/**
 * In production a missing APP_URL silently falls back to http://localhost:3002,
 * which ships dead links in real verification/reset emails (the bug this guards).
 * Log loudly at boot so the gap surfaces in deploy logs — but stay non-fatal:
 * crashing here would trip the stale-build deploy trap (Render keeps the last
 * healthy image and the new code never goes live).
 */
function warnIfAppUrlMissing(logger: Logger): void {
  const url = process.env.APP_URL;
  if (process.env.NODE_ENV === 'production' && !(url && url.length > 0)) {
    logger.error(
      'APP_URL is not set — verification and password-reset emails will link to ' +
        'http://localhost:3002 instead of the live dashboard. Set APP_URL to the ' +
        'dashboard origin (e.g. https://stoic-piggy-parents.noofficelocation.com).',
    );
  }
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
