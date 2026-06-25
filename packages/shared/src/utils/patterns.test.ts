import { describe, expect, it } from 'vitest';
import { computeChildPatterns } from './index';

const base = {
  windowDays: 30,
  inflowCents: 0,
  spentCents: 0,
  savedToGoalsCents: 0,
  resistedCount: 0,
  resistedCents: 0,
};

describe('computeChildPatterns', () => {
  it('derives save + patience rates from sums', () => {
    const p = computeChildPatterns({
      ...base,
      inflowCents: 10000,
      spentCents: 4000,
      resistedCount: 2,
      resistedCents: 6000,
    });
    expect(p.saveRate).toBe(60); // kept 60% of inflow
    expect(p.patienceScore).toBe(60); // resisted 6000 of 10000 tempted
  });

  it('never divides by zero (no activity → 0s)', () => {
    const p = computeChildPatterns(base);
    expect(p.saveRate).toBe(0);
    expect(p.patienceScore).toBe(0);
  });

  it('clamps save rate to 0 when overspending', () => {
    expect(computeChildPatterns({ ...base, inflowCents: 1000, spentCents: 5000 }).saveRate).toBe(0);
  });
});
