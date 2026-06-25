import type { DashboardChild } from '@stoicpiggy/shared';
import { describe, expect, it } from 'vitest';
import { mapDashboardChildToKid } from './mapKid';

const base: DashboardChild = {
  id: 'c1',
  displayName: 'Marco',
  age: 12,
  level: 7,
  xp: 1240,
  balanceCents: 34000,
  allowanceCents: 5000,
  autopayEnabled: true,
  active: true,
  goal: { title: 'Bici nueva', targetCents: 50000, savedCents: 34000 },
};

describe('mapDashboardChildToKid', () => {
  it('converts cents to whole dollars', () => {
    const kid = mapDashboardChildToKid(base, 0);
    expect(kid.balance).toBe(340);
    expect(kid.goalTarget).toBe(500);
    expect(kid.allowance).toBe(50);
  });

  it('derives the initial and reuses the goal title for both languages', () => {
    const kid = mapDashboardChildToKid(base, 0);
    expect(kid.initial).toBe('M');
    expect(kid.goalEs).toBe('Bici nueva');
    expect(kid.goalEn).toBe('Bici nueva');
  });

  it('falls back to a sensible default goal when none is set', () => {
    const kid = mapDashboardChildToKid({ ...base, goal: undefined }, 1);
    expect(kid.goalTarget).toBe(500);
    expect(kid.goalEn).toBe('Savings goal');
  });

  it('assigns palette colors deterministically by index', () => {
    expect(mapDashboardChildToKid(base, 0).color).toBe('#E63946');
    expect(mapDashboardChildToKid(base, 1).color).toBe('#457B9D');
  });

  it('keeps autopay and carries level through', () => {
    const kid = mapDashboardChildToKid(base, 0);
    expect(kid.autopay).toBe(true);
    expect(kid.lvl).toBe(7);
  });
});
