import { formatMoney } from '@stoicpiggy/shared';

export function StatCard({ label, amountCents }: { label: string; amountCents: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{formatMoney(amountCents)}</p>
    </div>
  );
}
