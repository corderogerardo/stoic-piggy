import { describe, expect, it } from 'vitest';
import { levelForXp } from '../constants';
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
  it('derives level from xp', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(250)).toBe(3);
  });
});
