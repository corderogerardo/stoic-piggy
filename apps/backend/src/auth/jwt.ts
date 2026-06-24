import type { AuthRole } from '@stoicpiggy/shared';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

/** Claims we put in the signed token. `sub` is the parent/child id. */
export interface AuthClaims {
  sub: string;
  role: AuthRole;
  /** Present only for child tokens — the owning parent's id. */
  parentId?: string;
}

const DEFAULT_EXPIRY = '30d' as const;

export function signToken(
  claims: AuthClaims,
  secret: string,
  expiresIn: SignOptions['expiresIn'] = DEFAULT_EXPIRY,
): string {
  const payload: Record<string, unknown> = { role: claims.role };
  if (claims.parentId) payload.parentId = claims.parentId;
  return jwt.sign(payload, secret, { subject: claims.sub, expiresIn });
}

/** Verify a token and return its claims, or null if invalid/expired/malformed. */
export function verifyToken(token: string, secret: string): AuthClaims | null {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    const sub = decoded.sub;
    const role = decoded.role;
    if (typeof sub !== 'string' || (role !== 'parent' && role !== 'child')) return null;
    const parentId = typeof decoded.parentId === 'string' ? decoded.parentId : undefined;
    return { sub, role, parentId };
  } catch {
    return null;
  }
}
