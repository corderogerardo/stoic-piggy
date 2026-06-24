import { createHash, randomBytes } from 'node:crypto';

/** Email-verification links live for 24h; password-reset links for 1h (more sensitive). */
export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
export const RESET_TTL_MS = 60 * 60 * 1000;
/** Minimum gap between "resend"/"forgot" emails for the same account (anti-spam). */
export const RESEND_THROTTLE_MS = 60 * 1000;

/**
 * Mint a single-use token. The raw value goes in the emailed link; only its
 * SHA-256 hash is stored, so a database leak can't be replayed as a live link.
 */
export function newToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString('base64url');
  return { raw, hash: hashToken(raw) };
}

/** Hash a raw token the same way it was stored, for lookup on redemption. */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}
