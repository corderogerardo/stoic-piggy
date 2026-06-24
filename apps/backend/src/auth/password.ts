import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/** Hash a plaintext password for storage. */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext password to a stored hash. Returns false (never throws)
 * for empty/invalid hashes — e.g. legacy rows backfilled with an empty hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
