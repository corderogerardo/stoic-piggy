import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '../constants';
import type { ChildPatterns } from '../types';

const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/**
 * Derive coach signals from already-summed cent totals. Pure — the backend does
 * the Prisma aggregation, this turns the sums into save/patience rates so the
 * math is testable without a database.
 */
export function computeChildPatterns(input: {
  windowDays: number;
  inflowCents: number;
  spentCents: number;
  savedToGoalsCents: number;
  resistedCount: number;
  resistedCents: number;
}): ChildPatterns {
  const { inflowCents, spentCents, resistedCents } = input;
  const tempted = resistedCents + spentCents;
  return {
    ...input,
    saveRate: inflowCents > 0 ? clamp100((1 - spentCents / inflowCents) * 100) : 0,
    patienceScore: tempted > 0 ? clamp100((resistedCents / tempted) * 100) : 0,
  };
}

/** Format an integer cent amount as a localized currency string. */
export function formatMoney(
  cents: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

/** Progress (0..1) of a savings goal. */
export function goalProgress(savedCents: number, targetCents: number): number {
  if (targetCents <= 0) return 0;
  return Math.min(1, savedCents / targetCents);
}
