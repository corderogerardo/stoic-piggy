'use client';

import { useReports } from '@stoicpiggy/api';
import { centsToDollars } from '@stoicpiggy/shared';
import { Piggy } from '@stoicpiggy/ui';

type Lang = 'es' | 'en';

const T = {
  es: {
    loading: 'Cargando…',
    completed: 'Tareas completadas',
    paid: 'Pagado este mes',
    saved: 'Ahorrado en total',
    kids: 'Hijos activos',
    chartTitle: 'Tareas completadas',
    chartSub: 'Esta semana, por día',
    savedTitle: 'Ahorro de la familia',
    savedSub: 'Lo que tus hijos tienen guardado en sus cochinitas ahora mismo.',
    savedLabel: 'ahorrado por tus hijos',
  },
  en: {
    loading: 'Loading…',
    completed: 'Tasks completed',
    paid: 'Paid this month',
    saved: 'Total saved',
    kids: 'Active kids',
    chartTitle: 'Tasks completed',
    chartSub: 'This week, by day',
    savedTitle: 'Family savings',
    savedSub: 'What your kids have tucked away in their piggy banks right now.',
    savedLabel: 'saved by your kids',
  },
} as const;

const usd = (cents: number) => `$${Math.round(centsToDollars(cents)).toLocaleString()}`;

/** Weekday labels for the last 7 days (oldest → newest), localized. */
function weekdayLabels(lang: Lang): string[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - i));
    return d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { weekday: 'short' });
  });
}

export function ReportsView({ lang }: { lang: Lang }) {
  const t = T[lang];
  const reports = useReports();
  const d = reports.data;
  const labels = weekdayLabels(lang);
  const byDay = d?.tasksByDay ?? [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(1, ...byDay);

  const stats = [
    { t: t.completed, v: String(d?.tasksCompletedThisWeek ?? 0) },
    { t: t.paid, v: usd(d?.paidThisMonthCents ?? 0) },
    { t: t.saved, v: usd(d?.savedCents ?? 0) },
    { t: t.kids, v: String(d?.activeKids ?? 0) },
  ];

  return (
    <div className="flex flex-col gap-[22px]">
      {reports.isPending && <p className="px-1 text-[13.5px] text-navy/55">{t.loading}</p>}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
        {stats.map((s) => (
          <div key={s.t} className="rounded-[18px] border border-navy/10 bg-white p-5">
            <div className="mb-3 text-[10.5px] font-extrabold tracking-[0.5px] text-navy/50">
              {s.t}
            </div>
            <div className="font-mono text-[28px] font-bold tracking-[-1px]">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-[18px]">
        <div className="min-w-[320px] flex-[1_1_420px] rounded-[20px] border border-navy/10 bg-white p-6">
          <h2 className="m-0 mb-1 text-base font-extrabold">{t.chartTitle}</h2>
          <p className="m-0 mb-[22px] text-[13px] text-navy/60">{t.chartSub}</p>
          <div className="flex h-[170px] items-end gap-[14px]">
            {byDay.map((val, i) => (
              <div
                key={labels[i]}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="font-mono text-[11px] font-bold text-navy/50">{val}</span>
                <div
                  className={`w-full max-w-[34px] rounded-t-lg ${i === 6 ? 'bg-accent' : 'bg-blue/60'}`}
                  style={{ height: `${Math.round((val / max) * 130)}px` }}
                />
                <span className="text-[11px] font-bold text-navy/50">{labels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-[280px] flex-[1_1_280px] flex-col rounded-[20px] bg-navy p-6 text-cream">
          <div className="mb-[14px] inline-block">
            <Piggy mood="zen" size={56} />
          </div>
          <h2 className="m-0 mb-1 text-base font-extrabold">{t.savedTitle}</h2>
          <p className="m-0 mb-5 text-[13px] leading-relaxed text-cream/75">{t.savedSub}</p>
          <div className="mt-auto font-mono text-[46px] font-bold tracking-[-2px]">
            {usd(d?.savedCents ?? 0)}
          </div>
          <div className="text-[12.5px] font-bold text-teal">{t.savedLabel}</div>
        </div>
      </div>
    </div>
  );
}
