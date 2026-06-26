export const APP_NAME = 'Stoic Piggy';
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_LOCALE = 'en-US';

/** Gamification tuning. 7 levels (Beginner → Expert), each 1000 XP wide. */
export const XP_PER_LEVEL = 1000;
export const MAX_LEVEL = 7;
/** Cash credited to the kid's piggy bank each time they reach a new level. */
export const MONEY_PER_LEVEL_CENTS = 500;

/** Derive a 1-based level (1..MAX_LEVEL) from an absolute XP total. */
export function levelForXp(xp: number): number {
  const level = Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
  return Math.min(MAX_LEVEL, level);
}

/**
 * Cents earned by crossing level boundaries when XP goes oldXp → newXp.
 * Pure so it's unit-testable; the backend applies the credit transactionally.
 */
export function levelUpRewardCents(oldXp: number, newXp: number): number {
  const gained = levelForXp(newXp) - levelForXp(oldXp);
  return gained > 0 ? gained * MONEY_PER_LEVEL_CENTS : 0;
}
