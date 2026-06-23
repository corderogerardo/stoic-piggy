'use client';

import { useApiHealth } from '@stoicpiggy/api';

/** Live connection badge — turns green when the tRPC backend is reachable. */
export function ApiStatus() {
  const health = useApiHealth();
  const ok = health.data?.status === 'ok';
  const dot = health.isPending ? 'bg-navy/30' : ok ? 'bg-success' : 'bg-accent';
  const text = health.isPending ? 'text-navy/50' : ok ? 'text-success' : 'text-accent';
  const label = health.isPending ? 'API…' : ok ? 'API' : 'API off';

  return (
    <span
      title={ok ? 'Connected to the tRPC API' : 'API not reachable — start the backend'}
      className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-white px-3 py-[9px] text-[11px] font-extrabold tracking-[0.4px]"
    >
      <span className={`h-[7px] w-[7px] rounded-full ${dot}`} />
      <span className={text}>{label}</span>
    </span>
  );
}
