'use client';

import {
  useApproveTask,
  useMyDashboard,
  usePendingApprovals,
  useRejectTask,
  useTRPC,
} from '@stoicpiggy/api';
import { Piggy } from '@stoicpiggy/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { rewardLabel } from './TasksView';

type Lang = 'es' | 'en';

const PALETTE = ['#E63946', '#457B9D', '#1D3557', '#2FAE6B', '#E9A23B'];

const T = {
  es: {
    loading: 'Cargando…',
    allClear: '¡Todo al día!',
    allClearSub: 'No hay tareas esperando tu aprobación.',
    sendBack: 'Devolver',
    approve: 'Aprobar y pagar',
    approveXp: 'Aprobar',
    cat: { chore: 'Quehacer', lesson: 'Lección' },
  },
  en: {
    loading: 'Loading…',
    allClear: 'All caught up!',
    allClearSub: 'No tasks waiting for your approval.',
    sendBack: 'Send back',
    approve: 'Approve & pay',
    approveXp: 'Approve',
    cat: { chore: 'Chore', lesson: 'Lesson' },
  },
} as const;

export function ApprovalsView({ lang }: { lang: Lang }) {
  const t = T[lang];
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const pending = usePendingApprovals();
  const dash = useMyDashboard();
  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  const kidById = useMemo(() => {
    const m = new Map<string, { name: string; color: string }>();
    for (const [i, k] of (dash.data ?? []).entries()) {
      m.set(k.id, { name: k.displayName, color: PALETTE[i % PALETTE.length] ?? '#E63946' });
    }
    return m;
  }, [dash.data]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: trpc.tasks.pendingApprovals.queryKey() });
    await queryClient.invalidateQueries({ queryKey: trpc.tasks.listByParent.queryKey() });
    await queryClient.invalidateQueries({ queryKey: trpc.children.dashboard.queryKey() });
  };

  const items = pending.data ?? [];
  const busy = approveTask.isPending || rejectTask.isPending;

  if (pending.isPending) {
    return <p className="px-1 text-[13.5px] text-navy/55">{t.loading}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="px-5 py-[60px] text-center">
        <div className="mb-4 inline-block">
          <Piggy mood="happy" size={100} />
        </div>
        <div className="text-[22px] font-extrabold">{t.allClear}</div>
        <div className="mt-1.5 text-[14.5px] text-navy/60">{t.allClearSub}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-4">
      {items.map((task) => {
        const kid = kidById.get(task.childId);
        return (
          <div key={task.id} className="rounded-[20px] border border-navy/10 bg-white p-[22px]">
            <div className="mb-4 flex items-center gap-[13px]">
              <span
                className="flex h-12 w-12 flex-none items-center justify-center rounded-[13px] text-[18px] font-extrabold text-cream"
                style={{ background: kid?.color ?? '#1D3557' }}
              >
                {(kid?.name.charAt(0) ?? '?').toUpperCase()}
              </span>
              <div className="flex-1">
                <div className="text-base font-extrabold leading-tight">{task.title}</div>
                <div className="text-xs text-navy/60">
                  {kid?.name ?? '—'} · {t.cat[task.category]}
                </div>
              </div>
              <span className="font-mono text-[16px] font-bold text-blue">{rewardLabel(task)}</span>
            </div>
            {task.note && (
              <div className="mb-4 flex gap-2.5 rounded-[13px] bg-canvas px-[15px] py-[13px] text-[13px] leading-relaxed text-navy/70">
                <i className="fa fa-quote-left mt-0.5 text-xs text-navy/30" />
                {task.note}
              </div>
            )}
            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  await rejectTask.mutateAsync({ taskId: task.id });
                  await refresh();
                }}
                className="flex-1 rounded-xl border-2 border-navy/15 bg-white py-3 text-[13.5px] font-extrabold text-navy/70 disabled:opacity-50"
              >
                {t.sendBack}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  await approveTask.mutateAsync({ taskId: task.id });
                  await refresh();
                }}
                className="inline-flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-accent py-3 text-[13.5px] font-extrabold text-cream disabled:opacity-50"
              >
                <i className="fa fa-check" />
                {task.payType === 'xp' ? t.approveXp : t.approve}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
