import { describe, expect, it } from 'vitest';
import { levelForXp, levelUpRewardCents } from '../constants';
import { centsToDollars, dollarsToCents, formatMoney, goalProgress } from './index';

describe('money utils', () => {
  it('formats USD cents', () => {
    expect(formatMoney(12345)).toBe('$123.45');
  });

  it('converts dollars to cents', () => {
    expect(dollarsToCents(1.99)).toBe(199);
  });

  it('converts cents to dollars', () => {
    expect(centsToDollars(250)).toBe(2.5);
  });

  it('caps goal progress at 1', () => {
    expect(goalProgress(150, 100)).toBe(1);
    expect(goalProgress(50, 100)).toBe(0.5);
  });
});

describe('gamification', () => {
  it('derives level from xp (1000 XP/level, capped at 7)', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(999)).toBe(1);
    expect(levelForXp(1000)).toBe(2);
    expect(levelForXp(2500)).toBe(3);
    expect(levelForXp(99999)).toBe(7); // capped at MAX_LEVEL
  });

  it('pays $5 per level boundary crossed, nothing past the cap', () => {
    expect(levelUpRewardCents(950, 1000)).toBe(500); // level 1 → 2
    expect(levelUpRewardCents(1950, 2050)).toBe(500); // level 2 → 3
    expect(levelUpRewardCents(900, 2100)).toBe(1000); // two levels at once
    expect(levelUpRewardCents(0, 999)).toBe(0); // no boundary crossed
    expect(levelUpRewardCents(6000, 9000)).toBe(0); // already capped at level 7
  });
});
