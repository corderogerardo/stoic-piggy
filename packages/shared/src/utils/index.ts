import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '../constants';

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
