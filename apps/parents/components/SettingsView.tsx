'use client';

import { useParentSettings, useTRPC, useUpdateParentSettings } from '@stoicpiggy/api';
import type { PayoutMethod, UpdateParentSettingsInput } from '@stoicpiggy/shared';
import { useQueryClient } from '@tanstack/react-query';

type Lang = 'es' | 'en';

const T = {
  es: {
    loading: 'Cargando…',
    payoutTitle: 'Cómo se paga',
    payoutSub: 'Elige cómo entregas el dinero cuando apruebas una tarea o liberas un ahorro.',
    prefsTitle: 'Preferencias',
    soon: 'Próximamente',
    payouts: [
      {
        id: 'card' as const,
        icon: 'credit-card',
        title: 'Tarjeta',
        desc: 'Recarga una tarjeta prepago.',
      },
      { id: 'bank' as const, icon: 'bank', title: 'Banco', desc: 'Transferencia a una cuenta.' },
      { id: 'cash' as const, icon: 'money', title: 'Efectivo', desc: 'Lo entregas en persona.' },
    ],
    prefs: [
      {
        id: 'autoApproveTasks' as const,
        title: 'Aprobar tareas automáticamente',
        desc: 'Las tareas marcadas como hechas se aprueban y pagan al instante.',
        live: true,
      },
      {
        id: 'notifyEnabled' as const,
        title: 'Notificaciones',
        desc: 'Avísame cuando haya algo por aprobar.',
        live: false,
      },
      {
        id: 'weeklyReportEnabled' as const,
        title: 'Resumen semanal',
        desc: 'Recibe un resumen del progreso cada semana.',
        live: false,
      },
    ],
  },
  en: {
    loading: 'Loading…',
    payoutTitle: 'How you pay',
    payoutSub: 'Choose how money is delivered when you approve a task or release savings.',
    prefsTitle: 'Preferences',
    soon: 'Coming soon',
    payouts: [
      { id: 'card' as const, icon: 'credit-card', title: 'Card', desc: 'Top up a prepaid card.' },
      { id: 'bank' as const, icon: 'bank', title: 'Bank', desc: 'Transfer to an account.' },
      { id: 'cash' as const, icon: 'money', title: 'Cash', desc: 'You hand it over in person.' },
    ],
    prefs: [
      {
        id: 'autoApproveTasks' as const,
        title: 'Auto-approve tasks',
        desc: 'Tasks marked done are approved and paid out instantly.',
        live: true,
      },
      {
        id: 'notifyEnabled' as const,
        title: 'Notifications',
        desc: 'Tell me when something needs approval.',
        live: false,
      },
      {
        id: 'weeklyReportEnabled' as const,
        title: 'Weekly summary',
        desc: 'Get a weekly progress recap.',
        live: false,
      },
    ],
  },
} as const;

export function SettingsView({ lang }: { lang: Lang }) {
  const t = T[lang];
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const settingsQ = useParentSettings();
  const update = useUpdateParentSettings();
  const s = settingsQ.data;

  const save = async (patch: UpdateParentSettingsInput) => {
    await update.mutateAsync(patch);
    await queryClient.invalidateQueries({ queryKey: trpc.parent.settings.queryKey() });
  };

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button
      type="button"
      aria-pressed={on}
      disabled={update.isPending}
      onClick={onClick}
      className={`relative h-7 w-[50px] flex-none rounded-full transition-colors disabled:opacity-60 ${on ? 'bg-accent' : 'bg-navy/20'}`}
    >
      <span
        className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-all ${on ? 'left-[25px]' : 'left-[3px]'}`}
      />
    </button>
  );

  return (
    <div className="flex max-w-[620px] flex-col gap-4">
      {settingsQ.isPending && <p className="px-1 text-[13.5px] text-navy/55">{t.loading}</p>}

      <div className="rounded-[20px] border border-navy/10 bg-white p-6">
        <h2 className="m-0 mb-1 text-[17px] font-extrabold">{t.payoutTitle}</h2>
        <p className="m-0 mb-5 text-[13.5px] leading-relaxed text-navy/60">{t.payoutSub}</p>
        <div className="flex flex-col gap-3">
          {t.payouts.map((m) => {
            const on = (s?.payoutMethod ?? 'card') === m.id;
            return (
              <button
                type="button"
                key={m.id}
                disabled={update.isPending}
                onClick={() => save({ payoutMethod: m.id as PayoutMethod })}
                className={`flex items-center gap-[14px] rounded-[14px] border-2 p-[15px] text-left disabled:opacity-60 ${on ? 'border-accent bg-accent/[0.05]' : 'border-navy/10 bg-white'}`}
              >
                <span
                  className={`flex h-10 w-10 flex-none items-center justify-center rounded-[11px] ${on ? 'bg-accent' : 'bg-teal/40'}`}
                >
                  <i className={`fa fa-${m.icon} text-base ${on ? 'text-cream' : 'text-blue'}`} />
                </span>
                <div className="flex-1">
                  <div className="text-[14.5px] font-extrabold">{m.title}</div>
                  <div className="text-xs text-navy/60">{m.desc}</div>
                </div>
                <span
                  className={`flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border-2 ${on ? 'border-accent' : 'border-navy/20'}`}
                >
                  <span
                    className={`h-[11px] w-[11px] rounded-full ${on ? 'bg-accent' : 'bg-transparent'}`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[20px] border border-navy/10 bg-white p-6">
        <h2 className="m-0 mb-[18px] text-[17px] font-extrabold">{t.prefsTitle}</h2>
        <div className="flex flex-col gap-1">
          {t.prefs.map((p) => {
            const on = s ? s[p.id] : false;
            return (
              <div
                key={p.id}
                className="flex items-center gap-[14px] border-b border-navy/[0.07] py-[14px]"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[14.5px] font-bold">
                    {p.title}
                    {!p.live && (
                      <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-extrabold tracking-[0.3px] text-navy/50">
                        {t.soon}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-navy/60">{p.desc}</div>
                </div>
                <Toggle on={on} onClick={() => save({ [p.id]: !on })} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
