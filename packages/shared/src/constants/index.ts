export const APP_NAME = 'Stoic Piggy';
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_LOCALE = 'en-US';

/** Gamification tuning. */
export const XP_PER_LEVEL = 100;
export const MAX_LEVEL = 50;

/** Derive a 1-based level from an absolute XP total. */
export function levelForXp(xp: number): number {
  const level = Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
  return Math.min(MAX_LEVEL, level);
}
