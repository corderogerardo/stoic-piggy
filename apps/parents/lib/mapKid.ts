import { centsToDollars, type DashboardChild } from '@stoicpiggy/shared';
import type { Kid } from './content';

const PALETTE = ['#E63946', '#457B9D', '#1D3557', '#2FAE6B', '#E9A23B'];

/**
 * Map a live aggregated dashboard row (from the tRPC API) into the dashboard's
 * `Kid` view model. Gamification fields not yet modelled in the backend
 * (streak / resisted / tasksDone) default to 0 until those features land.
 */
export function mapDashboardChildToKid(dc: DashboardChild, index: number): Kid {
  const goalTarget = dc.goal ? Math.round(centsToDollars(dc.goal.targetCents)) : 500;
  return {
    id: dc.id,
    name: dc.displayName,
    age: dc.age ?? 0,
    lvl: dc.level,
    balance: Math.round(centsToDollars(dc.balanceCents)),
    streak: 0,
    resisted: 0,
    tasksDone: 0,
    color: PALETTE[index % PALETTE.length],
    initial: (dc.displayName.charAt(0) || '?').toUpperCase(),
    goalEs: dc.goal?.title ?? 'Meta de ahorro',
    goalEn: dc.goal?.title ?? 'Savings goal',
    goalTarget: goalTarget > 0 ? goalTarget : 500,
    allowance: Math.round(centsToDollars(dc.allowanceCents)),
    autopay: dc.autopayEnabled,
  };
}
