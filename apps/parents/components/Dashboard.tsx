'use client';

import { useMyDashboard, usePendingApprovals, useTasks } from '@stoicpiggy/api';
import { Piggy } from '@stoicpiggy/ui';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { ACTIVITY, type ActivityItem, type Kid, type Lang, STR, type View } from '@/lib/content';
import { mapDashboardChildToKid } from '@/lib/mapKid';
import { ApiStatus } from './ApiStatus';
import { ApprovalsView } from './ApprovalsView';
import { KidsView } from './KidsView';
import { TasksView } from './TasksView';
import { VerifyEmailBanner } from './VerifyEmailBanner';

const VIEWS: View[] = ['overview', 'tasks', 'approvals', 'kids', 'reports', 'settings'];
const NAV_ICON: Record<View, string> = {
  overview: 'th-large',
  tasks: 'list-ul',
  approvals: 'check-square-o',
  kids: 'users',
  reports: 'bar-chart',
  settings: 'cog',
};
const TONE_BG: Record<ActivityItem['tone'], string> = {
  red: 'bg-accent/15',
  blue: 'bg-blue/20',
  green: 'bg-success/20',
};
const TONE_FG: Record<ActivityItem['tone'], string> = {
  red: 'text-accent',
  blue: 'text-blue',
  green: 'text-success',
};
const BAR_VALS = [4, 6, 3, 7, 5, 8, 6];

export function Dashboard() {
  const { parent, logout } = useAuth();
  const [lang, setLang] = useState<Lang>('es');
  const [view, setView] = useState<View>('overview');
  const [kids, setKids] = useState<Kid[]>([]);
  const [activity] = useState<ActivityItem[]>(ACTIVITY);
  const [prefs, setPrefs] = useState({ notify: true, weekly: true, autoApprove: false });
  const [payoutMethod, setPayoutMethod] = useState('card');

  // Live data: the signed-in parent's real children + tasks (token-scoped on the server).
  // Only active kids are shown here; deactivated ones are managed in the Kids view.
  const liveChildren = useMyDashboard();
  const tasksQ = useTasks();
  const approvalsQ = usePendingApprovals();
  const liveKids = useMemo(
    () =>
      liveChildren.data
        ? liveChildren.data.filter((dc) => dc.active).map(mapDashboardChildToKid)
        : null,
    [liveChildren.data],
  );
  useEffect(() => {
    if (liveKids) setKids(liveKids);
  }, [liveKids]);

  const c = STR[lang];
  const tx = (o: { es: string; en: string }) => (lang === 'es' ? o.es : o.en);

  const togglePref = (id: 'notify' | 'weekly' | 'autoApprove') =>
    setPrefs({ ...prefs, [id]: !prefs[id] });

  const langBtn = (active: boolean) =>
    `flex-1 rounded-lg py-2 text-[11px] font-extrabold tracking-[0.5px] ${active ? 'bg-accent text-cream' : 'bg-transparent text-cream/70'}`;
  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-7 w-[50px] flex-none rounded-full transition-colors ${on ? 'bg-accent' : 'bg-navy/20'}`}
    >
      <span
        className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-all ${on ? 'left-[25px]' : 'left-[3px]'}`}
      />
    </button>
  );

  const [title, sub] = c.titles[view];
  const pendingCount = approvalsQ.data?.length ?? 0;
  const activeTaskCount = tasksQ.data?.filter((t) => t.status === 'active').length ?? 0;
  const statCards = [
    {
      key: 'toApprove' as const,
      icon: 'check-square-o',
      value: pendingCount,
      delta: lang === 'es' ? 'tareas esperando' : 'tasks waiting',
      accent: true,
    },
    {
      key: 'paid' as const,
      icon: 'money',
      value: '$1,240',
      delta: lang === 'es' ? 'pagado este mes' : 'paid this month',
      accent: false,
    },
    {
      key: 'saved' as const,
      icon: 'bank',
      value: `$${kids.reduce((sum, k) => sum + k.balance, 0)}`,
      delta: lang === 'es' ? 'ahorrado por tus hijos' : 'saved by your kids',
      accent: false,
    },
    {
      key: 'active' as const,
      icon: 'list-ul',
      value: activeTaskCount,
      delta: lang === 'es' ? 'tareas activas' : 'active tasks',
      accent: false,
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-canvas text-navy">
      {/* ============ SIDEBAR ============ */}
      <aside className="sticky top-0 flex h-screen w-[248px] flex-none flex-col bg-navy p-4 text-cream">
        <div className="flex items-center gap-[11px] px-2 pb-[22px] pt-1">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-accent">
            <Piggy mood="zen" size={28} />
          </span>
          <div className="leading-tight">
            <div className="text-base font-extrabold">Stoic Piggy</div>
            <div className="text-[10px] font-extrabold tracking-[0.6px] text-teal">
              {c.parentTag}
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-[3px]">
          {VIEWS.map((key) => {
            const active = view === key;
            const badge = key === 'approvals' ? pendingCount : 0;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setView(key)}
                className={`flex items-center gap-3 rounded-xl px-[13px] py-[11px] text-left text-sm font-bold ${active ? 'bg-white/10 text-cream' : 'bg-transparent text-cream/70'}`}
              >
                <i className={`fa fa-${NAV_ICON[key]} w-[18px] text-[15px]`} />
                <span className="flex-1">{c.navLabel[key]}</span>
                {badge > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-extrabold text-cream">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mb-3 flex gap-[5px] rounded-[11px] bg-white/[0.08] p-1">
          <button type="button" onClick={() => setLang('es')} className={langBtn(lang === 'es')}>
            ES
          </button>
          <button type="button" onClick={() => setLang('en')} className={langBtn(lang === 'en')}>
            EN
          </button>
        </div>
        <div className="flex items-center gap-[11px] border-t border-white/15 p-2.5">
          <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-blue text-[15px] font-extrabold text-cream">
            {(parent?.displayName ?? 'P').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[13.5px] font-extrabold">
              {parent?.displayName ?? 'Patricia'}
            </div>
            <div className="text-[11px] text-teal">{c.parentRole}</div>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label={lang === 'es' ? 'Cerrar sesión' : 'Sign out'}
            title={lang === 'es' ? 'Cerrar sesión' : 'Sign out'}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-sm text-teal hover:bg-white/10"
          >
            <i className="fa fa-sign-out" />
          </button>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <div className="flex min-w-0 flex-1 flex-col">
        <VerifyEmailBanner lang={lang} />
        {/* topbar */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-[18px] border-b border-navy/10 bg-canvas/90 px-[30px] py-[18px] backdrop-blur-[10px]">
          <div>
            <h1 className="m-0 text-2xl font-extrabold tracking-[-0.5px]">{title}</h1>
            <p className="m-0 mt-[3px] text-[13.5px] text-navy/60">{sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <ApiStatus />
            <button
              type="button"
              className="relative h-[42px] w-[42px] rounded-xl border border-navy/15 bg-white text-[15px] text-navy"
            >
              <i className="fa fa-bell-o" />
              <span className="absolute right-2.5 top-[9px] h-[7px] w-[7px] rounded-full bg-accent" />
            </button>
            <button
              type="button"
              onClick={() => setView('tasks')}
              className="inline-flex items-center gap-[9px] rounded-xl bg-accent px-[18px] py-3 text-sm font-extrabold text-cream"
            >
              <i className="fa fa-plus" />
              {c.newTask}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-[30px] pb-[60px] pt-7">
          {/* ===== OVERVIEW ===== */}
          {view === 'overview' && (
            <div className="flex flex-col gap-[26px]">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
                {statCards.map((s) => (
                  <div
                    key={s.key}
                    className={`rounded-[18px] p-5 ${s.accent ? 'bg-accent text-cream' : 'border border-navy/10 bg-white text-navy'}`}
                  >
                    <div className="mb-[14px] flex items-center justify-between">
                      <span
                        className={`text-[10.5px] font-extrabold tracking-[0.5px] ${s.accent ? 'text-cream/80' : 'text-navy/50'}`}
                      >
                        {c.statTitle[s.key]}
                      </span>
                      <span
                        className={`flex h-[34px] w-[34px] items-center justify-center rounded-[10px] ${s.accent ? 'bg-white/20' : 'bg-teal/40'}`}
                      >
                        <i
                          className={`fa fa-${s.icon} text-[15px] ${s.accent ? 'text-cream' : 'text-accent'}`}
                        />
                      </span>
                    </div>
                    <div className="font-mono text-[30px] font-bold leading-none tracking-[-1px]">
                      {s.value}
                    </div>
                    <div
                      className={`mt-[7px] text-xs font-semibold ${s.accent ? 'text-cream/80' : 'text-navy/60'}`}
                    >
                      {s.delta}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div className="mb-[14px] flex items-center justify-between">
                  <h2 className="m-0 text-[17px] font-extrabold">{c.yourKids}</h2>
                  <button
                    type="button"
                    onClick={() => setView('kids')}
                    className="text-[13px] font-extrabold text-accent"
                  >
                    {c.manage} <i className="fa fa-arrow-right" />
                  </button>
                </div>
                {liveChildren.isPending ? (
                  <p className="text-[13.5px] text-navy/55">
                    {lang === 'es' ? 'Cargando…' : 'Loading…'}
                  </p>
                ) : kids.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setView('kids')}
                    className="w-full rounded-[20px] border-2 border-dashed border-navy/15 bg-white px-5 py-8 text-center text-[13.5px] font-semibold text-navy/55 hover:border-accent hover:text-accent"
                  >
                    {lang === 'es'
                      ? 'Aún no tienes hijos. Crea la cuenta de tu primer hijo →'
                      : 'No kids yet. Create your first kid account →'}
                  </button>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                    {kids.map((k) => {
                      const pct = Math.min(100, Math.round((k.balance / k.goalTarget) * 100));
                      return (
                        <div
                          key={k.id}
                          className="rounded-[20px] border border-navy/10 bg-white p-5"
                        >
                          <div className="mb-4 flex items-center gap-[13px]">
                            <span
                              className="flex h-12 w-12 flex-none items-center justify-center rounded-[14px] text-[19px] font-extrabold text-cream"
                              style={{ background: k.color }}
                            >
                              {k.initial}
                            </span>
                            <div className="flex-1">
                              <div className="text-[16.5px] font-extrabold">{k.name}</div>
                              <div className="text-xs text-navy/60">
                                {c.ageLabel(k.age)} · {c.levelWord} {k.lvl}
                              </div>
                            </div>
                          </div>
                          <div className="mb-[15px] flex gap-2.5">
                            <div className="flex-1 rounded-[13px] bg-canvas px-[13px] py-[11px]">
                              <div className="text-[9.5px] font-extrabold tracking-[0.4px] text-navy/50">
                                {c.balance}
                              </div>
                              <div className="mt-[3px] font-mono text-[19px] font-bold">
                                ${k.balance}
                              </div>
                            </div>
                            <div className="flex-1 rounded-[13px] bg-canvas px-[13px] py-[11px]">
                              <div className="text-[9.5px] font-extrabold tracking-[0.4px] text-navy/50">
                                {lang === 'es' ? 'Mesada' : 'Allowance'}
                              </div>
                              <div className="mt-[3px] font-mono text-[19px] font-bold">
                                ${k.allowance}
                              </div>
                            </div>
                          </div>
                          <div className="mb-[7px] flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-navy/60">
                              <i className="fa fa-bullseye text-accent" />{' '}
                              {lang === 'es' ? k.goalEs : k.goalEn}
                            </span>
                            <span className="text-[11.5px] font-extrabold text-navy/50">
                              ${k.balance} / ${k.goalTarget}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-navy/10">
                            <div
                              className="h-full rounded-full bg-accent"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-[18px]">
                <div className="min-w-[300px] flex-[1_1_380px] rounded-[20px] border border-navy/10 bg-white p-[22px]">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="m-0 text-base font-extrabold">{c.pendingApproval}</h2>
                    <span className="rounded-full bg-accent/10 px-[11px] py-[5px] text-[11px] font-extrabold text-accent">
                      {pendingCount}
                    </span>
                  </div>
                  {pendingCount > 0 ? (
                    <div className="flex flex-col gap-3">
                      <p className="m-0 text-[13.5px] text-navy/65">
                        {lang === 'es'
                          ? `Tienes ${pendingCount} tarea(s) esperando tu aprobación.`
                          : `You have ${pendingCount} task(s) waiting for approval.`}
                      </p>
                      <button
                        type="button"
                        onClick={() => setView('approvals')}
                        className="inline-flex w-fit items-center gap-2 rounded-[11px] bg-accent px-4 py-2.5 text-[13px] font-extrabold text-cream"
                      >
                        {lang === 'es' ? 'Revisar aprobaciones' : 'Review approvals'}
                        <i className="fa fa-arrow-right" />
                      </button>
                    </div>
                  ) : (
                    <div className="px-2.5 py-[26px] text-center">
                      <div className="mb-2.5 inline-block">
                        <Piggy mood="happy" size={60} />
                      </div>
                      <div className="text-sm font-extrabold">{c.allClear}</div>
                      <div className="mt-[3px] text-[12.5px] text-navy/60">{c.allClearSub}</div>
                    </div>
                  )}
                </div>

                <div className="min-w-[280px] flex-[1_1_300px] rounded-[20px] border border-navy/10 bg-white p-[22px]">
                  <h2 className="m-0 mb-4 text-base font-extrabold">{c.activity}</h2>
                  <div className="flex flex-col gap-[2px]">
                    {activity.slice(0, 6).map((a) => (
                      <div key={a.es} className="flex gap-[13px] py-[9px]">
                        <div className="flex flex-none flex-col items-center">
                          <span
                            className={`flex h-[30px] w-[30px] items-center justify-center rounded-[9px] ${TONE_BG[a.tone]}`}
                          >
                            <i className={`fa fa-${a.icon} text-xs ${TONE_FG[a.tone]}`} />
                          </span>
                          <span className="mt-1 w-[2px] flex-1 bg-navy/[0.08]" />
                        </div>
                        <div className="flex-1 pb-1.5">
                          <div className="text-[13px] leading-snug text-navy/85">{tx(a)}</div>
                          <div className="mt-0.5 text-[11px] text-navy/45">
                            {lang === 'es' ? a.timeEs : a.timeEn}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TASKS ===== */}
          {view === 'tasks' && <TasksView lang={lang} />}

          {/* ===== APPROVALS ===== */}
          {view === 'approvals' && <ApprovalsView lang={lang} />}

          {/* ===== KIDS ===== */}
          {view === 'kids' && <KidsView lang={lang} />}

          {/* ===== REPORTS ===== */}
          {view === 'reports' && (
            <div className="flex flex-col gap-[22px]">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
                {c.reportStats.map((s) => (
                  <div key={s.t} className="rounded-[18px] border border-navy/10 bg-white p-5">
                    <div className="mb-3 text-[10.5px] font-extrabold tracking-[0.5px] text-navy/50">
                      {s.t}
                    </div>
                    <div className="font-mono text-[28px] font-bold tracking-[-1px]">{s.v}</div>
                    <div className="mt-1.5 text-xs font-bold text-blue">
                      <i className="fa fa-arrow-up" /> {s.d}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-[18px]">
                <div className="min-w-[320px] flex-[1_1_420px] rounded-[20px] border border-navy/10 bg-white p-6">
                  <h2 className="m-0 mb-1 text-base font-extrabold">{c.tasksThisWeek}</h2>
                  <p className="m-0 mb-[22px] text-[13px] text-navy/60">{c.tasksThisWeekSub}</p>
                  <div className="flex h-[170px] items-end gap-[14px]">
                    {BAR_VALS.map((val, i) => (
                      <div
                        key={c.days[i]}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      >
                        <span className="font-mono text-[11px] font-bold text-navy/50">{val}</span>
                        <div
                          className={`w-full max-w-[34px] rounded-t-lg ${i === 5 ? 'bg-accent' : 'bg-blue/60'}`}
                          style={{ height: `${Math.round((val / 8) * 130)}px` }}
                        />
                        <span className="text-[11px] font-bold text-navy/50">{c.days[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex min-w-[280px] flex-[1_1_280px] flex-col rounded-[20px] bg-navy p-6 text-cream">
                  <div className="mb-[14px] inline-block">
                    <Piggy mood="zen" size={56} />
                  </div>
                  <h2 className="m-0 mb-1 text-base font-extrabold">{c.impulseTitle}</h2>
                  <p className="m-0 mb-5 text-[13px] leading-relaxed text-cream/75">
                    {c.impulseSub}
                  </p>
                  <div className="mt-auto font-mono text-[46px] font-bold tracking-[-2px]">
                    $2,340
                  </div>
                  <div className="text-[12.5px] font-bold text-teal">{c.impulseSaved}</div>
                </div>
              </div>
            </div>
          )}

          {/* ===== SETTINGS ===== */}
          {view === 'settings' && (
            <div className="flex max-w-[620px] flex-col gap-4">
              <div className="rounded-[20px] border border-navy/10 bg-white p-6">
                <h2 className="m-0 mb-1 text-[17px] font-extrabold">{c.payoutTitle}</h2>
                <p className="m-0 mb-5 text-[13.5px] leading-relaxed text-navy/60">{c.payoutSub}</p>
                <div className="flex flex-col gap-3">
                  {c.payouts.map((m) => {
                    const on = payoutMethod === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPayoutMethod(m.id)}
                        className={`flex items-center gap-[14px] rounded-[14px] border-2 p-[15px] text-left ${on ? 'border-accent bg-accent/[0.05]' : 'border-navy/10 bg-white'}`}
                      >
                        <span
                          className={`flex h-10 w-10 flex-none items-center justify-center rounded-[11px] ${on ? 'bg-accent' : 'bg-teal/40'}`}
                        >
                          <i
                            className={`fa fa-${m.icon} text-base ${on ? 'text-cream' : 'text-blue'}`}
                          />
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
                <h2 className="m-0 mb-[18px] text-[17px] font-extrabold">{c.prefsTitle}</h2>
                <div className="flex flex-col gap-1">
                  {c.prefsList.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-[14px] border-b border-navy/[0.07] py-[14px]"
                    >
                      <div className="flex-1">
                        <div className="text-[14.5px] font-bold">{p.title}</div>
                        <div className="mt-0.5 text-[12.5px] text-navy/60">{p.desc}</div>
                      </div>
                      <Toggle on={prefs[p.id]} onClick={() => togglePref(p.id)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
