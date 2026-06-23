'use client';

import { useDashboardChildren } from '@stoicpiggy/api';
import { Piggy } from '@stoicpiggy/ui';
import { useEffect, useMemo, useState } from 'react';
import {
  ACTIVITY,
  type ActivityItem,
  APPROVALS,
  type Approval,
  KIDS,
  type Kid,
  type Lang,
  STR,
  TASKS,
  type TaskItem,
  type View,
} from '@/lib/content';
import { mapDashboardChildToKid } from '@/lib/mapKid';
import { ApiStatus } from './ApiStatus';

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
const ICON_LIST = [
  'star',
  'trash-o',
  'bed',
  'book',
  'cutlery',
  'paw',
  'car',
  'paint-brush',
  'leaf',
  'shopping-basket',
  'pencil',
  'graduation-cap',
];
const RECUR_ICON: Record<'once' | 'daily' | 'weekly', string> = {
  once: 'calendar-o',
  daily: 'sun-o',
  weekly: 'refresh',
};
const BAR_VALS = [4, 6, 3, 7, 5, 8, 6];

const FALLBACK_KID: Kid = KIDS[0] ?? {
  id: '',
  name: '',
  age: 0,
  lvl: 0,
  balance: 0,
  streak: 0,
  resisted: 0,
  tasksDone: 0,
  color: '#1D3557',
  initial: '?',
  goalEs: '',
  goalEn: '',
  goalTarget: 1,
  allowance: 0,
  autopay: false,
};

interface Draft {
  name: string;
  icon: string;
  cat: 'chore' | 'lesson';
  payType: 'money' | 'xp' | 'both';
  amount: number;
  xp: number;
  assignee: string;
  recur: 'once' | 'daily' | 'weekly';
}
const newDraft = (): Draft => ({
  name: '',
  icon: 'star',
  cat: 'chore',
  payType: 'money',
  amount: 30,
  xp: 50,
  assignee: 'marco',
  recur: 'once',
});

export function Dashboard() {
  const [lang, setLang] = useState<Lang>('es');
  const [view, setView] = useState<View>('overview');
  const [kids, setKids] = useState<Kid[]>(KIDS);
  const [tasks, setTasks] = useState<TaskItem[]>(TASKS);
  const [approvals, setApprovals] = useState<Approval[]>(APPROVALS);
  const [activity, setActivity] = useState<ActivityItem[]>(ACTIVITY);
  const [taskFilter, setTaskFilter] = useState<'all' | 'chore' | 'lesson'>('all');
  const [prefs, setPrefs] = useState({ notify: true, weekly: true, autoApprove: false });
  const [payoutMethod, setPayoutMethod] = useState('card');
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(newDraft());

  // Live data: swap seed kids for the demo parent's real children once the API responds.
  const demoParentId = process.env.NEXT_PUBLIC_DEMO_PARENT_ID ?? 'seed-parent';
  const liveChildren = useDashboardChildren(demoParentId);
  const liveKids = useMemo(
    () =>
      liveChildren.data && liveChildren.data.length > 0
        ? liveChildren.data.map(mapDashboardChildToKid)
        : null,
    [liveChildren.data],
  );
  useEffect(() => {
    if (liveKids) setKids(liveKids);
  }, [liveKids]);

  const c = STR[lang];
  const kidOf = (id: string): Kid => kids.find((k) => k.id === id) ?? FALLBACK_KID;
  const tx = (o: { es: string; en: string }) => (lang === 'es' ? o.es : o.en);
  const setD = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const openModal = () => {
    setDraft(newDraft());
    setStep(1);
    setModalOpen(true);
  };

  const stepNext = () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    const name = draft.name.trim() || (lang === 'es' ? 'Tarea nueva' : 'New task');
    const kid = kidOf(draft.assignee);
    const task: TaskItem = {
      id: Date.now(),
      es: name,
      en: name,
      icon: draft.icon,
      cat: draft.cat,
      kid: draft.assignee,
      payType: draft.payType,
      amount: draft.amount,
      xp: draft.xp,
      recur: draft.recur,
      status: 'active',
    };
    setTasks([task, ...tasks]);
    setActivity([
      {
        es: `Creaste "${name}" para ${kid.name}`,
        en: `You created "${name}" for ${kid.name}`,
        icon: draft.icon,
        tone: 'blue',
        timeEs: 'Ahora',
        timeEn: 'Now',
      },
      ...activity,
    ]);
    setModalOpen(false);
    setView('tasks');
  };
  const stepBack = () => (step > 1 ? setStep(step - 1) : setModalOpen(false));

  const approve = (id: number) => {
    const a = approvals.find((x) => x.id === id);
    if (!a) return;
    const kid = kidOf(a.kid);
    if (a.payType !== 'xp' && a.amount)
      setKids(
        kids.map((k) => (k.id === a.kid ? { ...k, balance: k.balance + (a.amount ?? 0) } : k)),
      );
    const rw = a.payType === 'xp' ? `+${a.xp} XP` : `+$${a.amount}`;
    setApprovals(approvals.filter((x) => x.id !== id));
    setActivity([
      {
        es: `Aprobaste "${a.es}" para ${kid.name} (${rw})`,
        en: `You approved "${a.en}" for ${kid.name} (${rw})`,
        icon: 'check',
        tone: 'green',
        timeEs: 'Ahora',
        timeEn: 'Now',
      },
      ...activity,
    ]);
  };
  const reject = (id: number) => {
    const a = approvals.find((x) => x.id === id);
    if (!a) return;
    const kid = kidOf(a.kid);
    setApprovals(approvals.filter((x) => x.id !== id));
    setActivity([
      {
        es: `Devolviste "${a.es}" a ${kid.name}`,
        en: `You sent "${a.en}" back to ${kid.name}`,
        icon: 'undo',
        tone: 'red',
        timeEs: 'Ahora',
        timeEn: 'Now',
      },
      ...activity,
    ]);
  };

  const togglePref = (id: 'notify' | 'weekly' | 'autoApprove') =>
    setPrefs({ ...prefs, [id]: !prefs[id] });
  const toggleAuto = (id: string) =>
    setKids(kids.map((k) => (k.id === id ? { ...k, autopay: !k.autopay } : k)));

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
  const filteredTasks = tasks.filter((t) => taskFilter === 'all' || t.cat === taskFilter);
  const statCards = [
    {
      key: 'toApprove' as const,
      icon: 'check-square-o',
      value: approvals.length,
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
      value: tasks.length,
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
            const badge = key === 'approvals' && approvals.length ? approvals.length : 0;
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
            P
          </span>
          <div className="flex-1 leading-tight">
            <div className="text-[13.5px] font-extrabold">Patricia</div>
            <div className="text-[11px] text-teal">{c.parentRole}</div>
          </div>
          <i className="fa fa-cog text-sm text-teal" />
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <div className="flex min-w-0 flex-1 flex-col">
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
              onClick={openModal}
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
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                  {kids.map((k) => {
                    const pct = Math.min(100, Math.round((k.balance / k.goalTarget) * 100));
                    return (
                      <div key={k.id} className="rounded-[20px] border border-navy/10 bg-white p-5">
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
                          <span className="inline-flex items-center gap-[5px] rounded-full bg-accent/10 px-2.5 py-1.5 text-[10px] font-extrabold text-accent">
                            <i className="fa fa-fire" />
                            {lang === 'es' ? `${k.streak} días` : `${k.streak}d`}
                          </span>
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
                              {c.tasksDone}
                            </div>
                            <div className="mt-[3px] font-mono text-[19px] font-bold">
                              {k.tasksDone}
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
              </div>

              <div className="flex flex-wrap gap-[18px]">
                <div className="min-w-[300px] flex-[1_1_380px] rounded-[20px] border border-navy/10 bg-white p-[22px]">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="m-0 text-base font-extrabold">{c.pendingApproval}</h2>
                    <span className="rounded-full bg-accent/10 px-[11px] py-[5px] text-[11px] font-extrabold text-accent">
                      {approvals.length}
                    </span>
                  </div>
                  {approvals.length > 0 ? (
                    <div className="flex flex-col gap-[11px]">
                      {approvals.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center gap-[13px] rounded-[14px] bg-canvas p-[13px]"
                        >
                          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-teal/40">
                            <i className={`fa fa-${a.icon} text-base text-accent`} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-extrabold leading-tight">{tx(a)}</div>
                            <div className="text-[11.5px] text-navy/60">
                              {kidOf(a.kid).name} · {lang === 'es' ? a.whenEs : a.whenEn}
                            </div>
                          </div>
                          <span className="font-mono text-sm font-bold text-blue">
                            {a.payType === 'xp' ? `+${a.xp} XP` : `+$${a.amount}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => reject(a.id)}
                            className="h-[34px] w-[34px] flex-none rounded-[10px] border border-navy/15 bg-white text-[13px] text-navy/50"
                          >
                            <i className="fa fa-times" />
                          </button>
                          <button
                            type="button"
                            onClick={() => approve(a.id)}
                            className="h-[34px] w-[34px] flex-none rounded-[10px] bg-accent text-[13px] text-cream"
                          >
                            <i className="fa fa-check" />
                          </button>
                        </div>
                      ))}
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
          {view === 'tasks' && (
            <div className="flex flex-col gap-[18px]">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap gap-2">
                  {c.filters.map((f) => {
                    const active = taskFilter === f.id;
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => setTaskFilter(f.id)}
                        className={`rounded-full border-[1.5px] px-4 py-[9px] text-[12.5px] font-extrabold ${active ? 'border-navy bg-navy text-cream' : 'border-navy/20 bg-transparent text-navy'}`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={openModal}
                  className="inline-flex items-center gap-2 rounded-[11px] border-2 border-navy bg-transparent px-4 py-[9px] text-[13px] font-extrabold text-navy"
                >
                  <i className="fa fa-plus" />
                  {c.newTask}
                </button>
              </div>

              <div className="overflow-hidden rounded-[20px] border border-navy/10 bg-white">
                <div className="flex items-center gap-[14px] border-b border-navy/[0.08] px-[22px] py-[13px] text-[10.5px] font-extrabold tracking-[0.5px] text-navy/50">
                  <span className="flex-1">{c.colTask}</span>
                  <span className="w-[130px]">{c.colKid}</span>
                  <span className="w-[110px]">{c.colRecur}</span>
                  <span className="w-[90px] text-right">{c.colReward}</span>
                  <span className="w-[110px] text-right">{c.colStatus}</span>
                </div>
                {filteredTasks.map((t) => {
                  const k = kidOf(t.kid);
                  const isXp = t.payType === 'xp';
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-[14px] border-b border-navy/[0.06] px-[22px] py-[15px]"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-[13px]">
                        <span
                          className={`flex h-10 w-10 flex-none items-center justify-center rounded-[11px] ${t.cat === 'lesson' ? 'bg-blue/20' : 'bg-teal/40'}`}
                        >
                          <i
                            className={`fa fa-${t.icon} text-base ${t.cat === 'lesson' ? 'text-blue' : 'text-accent'}`}
                          />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[14.5px] font-extrabold leading-tight">{tx(t)}</div>
                          <div className="text-[11.5px] text-navy/55">{c.catLabels[t.cat]}</div>
                        </div>
                      </div>
                      <div className="flex w-[130px] items-center gap-2">
                        <span
                          className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg text-[11px] font-extrabold text-cream"
                          style={{ background: k.color }}
                        >
                          {k.initial}
                        </span>
                        <span className="text-[13px] font-semibold">{k.name}</span>
                      </div>
                      <div className="w-[110px]">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy/70">
                          <i className={`fa fa-${RECUR_ICON[t.recur]} text-[11px] text-navy/40`} />
                          {c.recurLabels[t.recur]}
                        </span>
                      </div>
                      <div
                        className={`w-[90px] text-right font-mono text-sm font-bold ${isXp ? 'text-blue' : 'text-navy'}`}
                      >
                        {isXp ? `+${t.xp} XP` : `+$${t.amount}`}
                      </div>
                      <div className="w-[110px] text-right">
                        <span className="rounded-full bg-success/15 px-[11px] py-[5px] text-[10px] font-extrabold tracking-[0.3px] text-success">
                          {c.statusActive}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== APPROVALS ===== */}
          {view === 'approvals' &&
            (approvals.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-4">
                {approvals.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-[20px] border border-navy/10 bg-white p-[22px]"
                  >
                    <div className="mb-4 flex items-center gap-[13px]">
                      <span className="flex h-12 w-12 flex-none items-center justify-center rounded-[13px] bg-teal/40">
                        <i className={`fa fa-${a.icon} text-[20px] text-accent`} />
                      </span>
                      <div className="flex-1">
                        <div className="text-base font-extrabold leading-tight">{tx(a)}</div>
                        <div className="text-xs text-navy/60">
                          {kidOf(a.kid).name} · {lang === 'es' ? a.whenEs : a.whenEn}
                        </div>
                      </div>
                      <span className="font-mono text-[18px] font-bold text-blue">
                        {a.payType === 'xp' ? `+${a.xp} XP` : `+$${a.amount}`}
                      </span>
                    </div>
                    <div className="mb-4 flex gap-2.5 rounded-[13px] bg-canvas px-[15px] py-[13px] text-[13px] leading-relaxed text-navy/70">
                      <i className="fa fa-quote-left mt-0.5 text-xs text-navy/30" />
                      {lang === 'es' ? a.noteEs : a.noteEn}
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => reject(a.id)}
                        className="flex-1 rounded-xl border-2 border-navy/15 bg-white py-3 text-[13.5px] font-extrabold text-navy/70"
                      >
                        {c.sendBack}
                      </button>
                      <button
                        type="button"
                        onClick={() => approve(a.id)}
                        className="inline-flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-accent py-3 text-[13.5px] font-extrabold text-cream"
                      >
                        <i className="fa fa-check" />
                        {a.payType === 'xp' ? c.approveXp : c.approve}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-[60px] text-center">
                <div className="mb-4 inline-block">
                  <Piggy mood="happy" size={100} />
                </div>
                <div className="text-[22px] font-extrabold">{c.allClear}</div>
                <div className="mt-1.5 text-[14.5px] text-navy/60">{c.allClearSub}</div>
              </div>
            ))}

          {/* ===== KIDS ===== */}
          {view === 'kids' && (
            <div className="flex flex-col gap-4">
              {kids.map((k) => {
                const pct = Math.min(100, Math.round((k.balance / k.goalTarget) * 100));
                return (
                  <div key={k.id} className="rounded-[22px] border border-navy/10 bg-white p-6">
                    <div className="mb-[22px] flex flex-wrap items-center gap-4">
                      <span
                        className="flex h-[58px] w-[58px] flex-none items-center justify-center rounded-2xl text-2xl font-extrabold text-cream"
                        style={{ background: k.color }}
                      >
                        {k.initial}
                      </span>
                      <div className="min-w-[160px] flex-1">
                        <div className="text-xl font-extrabold">{k.name}</div>
                        <div className="text-[13px] text-navy/60">
                          {c.ageLabel(k.age)} · {c.levelWord} {k.lvl} · {k.streak} {c.streakWord}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <div className="rounded-[14px] bg-navy px-[18px] py-3 text-center text-cream">
                          <div className="text-[9.5px] font-extrabold tracking-[0.4px] text-teal">
                            {c.balance}
                          </div>
                          <div className="mt-[3px] font-mono text-[22px] font-bold">
                            ${k.balance}
                          </div>
                        </div>
                        <div className="rounded-[14px] bg-canvas px-[18px] py-3 text-center">
                          <div className="text-[9.5px] font-extrabold tracking-[0.4px] text-navy/50">
                            {c.resisted}
                          </div>
                          <div className="mt-[3px] font-mono text-[22px] font-bold text-accent">
                            {k.resisted}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-[18px]">
                      <div className="flex-[1_1_280px]">
                        <div className="mb-[11px] text-[11px] font-extrabold tracking-[0.5px] text-navy/50">
                          {c.savingsGoal}
                        </div>
                        <div className="rounded-2xl bg-canvas p-[18px]">
                          <div className="mb-[11px] flex items-center justify-between">
                            <span className="text-[15px] font-extrabold">
                              <i className="fa fa-bullseye mr-[7px] text-accent" />
                              {lang === 'es' ? k.goalEs : k.goalEn}
                            </span>
                            <span className="font-mono text-[13px] font-bold text-navy/60">
                              ${k.balance} / ${k.goalTarget}
                            </span>
                          </div>
                          <div className="mb-2.5 h-2.5 overflow-hidden rounded-full bg-navy/10">
                            <div
                              className="h-full rounded-full bg-accent"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="text-[12.5px] text-navy/60">
                            {lang === 'es'
                              ? `Faltan $${k.goalTarget - k.balance} · ${pct}% logrado`
                              : `$${k.goalTarget - k.balance} to go · ${pct}% there`}
                          </div>
                        </div>
                      </div>
                      <div className="flex-[1_1_280px]">
                        <div className="mb-[11px] text-[11px] font-extrabold tracking-[0.5px] text-navy/50">
                          {c.autoAllowance}
                        </div>
                        <div className="rounded-2xl bg-canvas p-[18px]">
                          <div className="mb-[14px] flex items-center justify-between">
                            <div>
                              <div className="text-sm font-extrabold">${k.allowance}</div>
                              <div className="text-xs text-navy/60">{c.everyWeek}</div>
                            </div>
                            <Toggle on={k.autopay} onClick={() => toggleAuto(k.id)} />
                          </div>
                          <div className="text-[12.5px] leading-relaxed text-navy/60">
                            {k.autopay
                              ? lang === 'es'
                                ? 'Se deposita cada lunes automáticamente.'
                                : 'Auto-deposited every Monday.'
                              : lang === 'es'
                                ? 'Mesada automática desactivada.'
                                : 'Auto allowance is off.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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

      {/* ============ TASK SETUP MODAL ============ */}
      {modalOpen && (
        <TaskModal
          {...{
            lang,
            c,
            step,
            draft,
            setD,
            kids,
            stepBack,
            stepNext,
            close: () => setModalOpen(false),
            setName: (v: string) => setD({ name: v }),
            amtUp: () => setD({ amount: draft.amount + 5 }),
            amtDown: () => setD({ amount: Math.max(0, draft.amount - 5) }),
            xpUp: () => setD({ xp: draft.xp + 10 }),
            xpDown: () => setD({ xp: Math.max(0, draft.xp - 10) }),
          }}
        />
      )}
    </div>
  );
}

interface ModalProps {
  lang: Lang;
  c: (typeof STR)['es'];
  step: number;
  draft: Draft;
  setD: (patch: Partial<Draft>) => void;
  kids: Kid[];
  stepBack: () => void;
  stepNext: () => void;
  close: () => void;
  setName: (v: string) => void;
  amtUp: () => void;
  amtDown: () => void;
  xpUp: () => void;
  xpDown: () => void;
}

function TaskModal({
  c,
  step,
  draft,
  setD,
  kids,
  stepBack,
  stepNext,
  close,
  setName,
  amtUp,
  amtDown,
  xpUp,
  xpDown,
}: ModalProps) {
  const optBorder = (on: boolean) =>
    on ? 'border-accent bg-accent/[0.07]' : 'border-navy/15 bg-white';
  const showMoney = draft.payType === 'money' || draft.payType === 'both';
  const showXp = draft.payType === 'xp' || draft.payType === 'both';
  const summaryReward =
    draft.payType === 'xp'
      ? `+${draft.xp} XP`
      : draft.payType === 'both'
        ? `+$${draft.amount} · +${draft.xp} XP`
        : `+$${draft.amount}`;
  const sumKid = kids.find((k) => k.id === draft.assignee) ?? FALLBACK_KID;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close is intentional
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismissal; keyboard users close with Escape
    <div
      onClick={close}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-navy/50 p-6 backdrop-blur-[3px]"
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation on the modal body */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: inner wrapper only stops backdrop propagation, not an interactive control */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-[26px] bg-canvas shadow-[0_30px_80px_rgba(11,19,32,0.4)]"
      >
        <div className="sticky top-0 z-[2] border-b border-navy/[0.08] bg-canvas px-[26px] pb-4 pt-[22px]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-extrabold tracking-[0.6px] text-accent">
                {c.modalEyebrow} · {step}/3
              </div>
              <h2 className="m-0 mt-[3px] text-[21px] font-extrabold">
                {c.stepTitles[step - 1] ?? ''}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="h-[38px] w-[38px] flex-none rounded-[11px] border border-navy/15 bg-white text-[15px] text-navy"
            >
              <i className="fa fa-times" />
            </button>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-[5px] flex-1 rounded-full ${n <= step ? 'bg-accent' : 'bg-navy/10'}`}
              />
            ))}
          </div>
        </div>

        <div className="px-[26px] pb-2 pt-[22px]">
          {step === 1 && (
            <div>
              <div className="mb-2 block text-[11px] font-extrabold tracking-[0.5px] text-navy/55">
                {c.taskNameLabel}
              </div>
              <input
                value={draft.name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.taskNamePh}
                className="mb-5 w-full rounded-[13px] border-2 border-navy/15 bg-white px-4 py-[14px] text-[15px] font-semibold text-navy outline-none"
              />
              <div className="mb-2 block text-[11px] font-extrabold tracking-[0.5px] text-navy/55">
                {c.categoryLabel}
              </div>
              <div className="mb-5 flex gap-2.5">
                {c.cats.map((o) => {
                  const on = draft.cat === o.id;
                  return (
                    <button
                      type="button"
                      key={o.id}
                      onClick={() =>
                        setD({ cat: o.id, payType: o.id === 'lesson' ? 'xp' : 'money' })
                      }
                      className={`flex-1 rounded-[14px] border-2 p-[15px] text-left ${optBorder(on)}`}
                    >
                      <i
                        className={`fa fa-${o.icon} text-[18px] ${on ? 'text-accent' : 'text-navy/50'}`}
                      />
                      <div className="mt-2 text-sm font-extrabold text-navy">{o.title}</div>
                      <div className="mt-0.5 text-[11.5px] text-navy/60">{o.desc}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mb-2 block text-[11px] font-extrabold tracking-[0.5px] text-navy/55">
                {c.iconLabel}
              </div>
              <div className="flex flex-wrap gap-[9px]">
                {ICON_LIST.map((ic) => {
                  const on = draft.icon === ic;
                  return (
                    <button
                      type="button"
                      key={ic}
                      onClick={() => setD({ icon: ic })}
                      className={`flex h-12 w-12 items-center justify-center rounded-[13px] border-2 ${on ? 'border-accent bg-accent' : 'border-navy/10 bg-white'}`}
                    >
                      <i
                        className={`fa fa-${ic} text-[18px] ${on ? 'text-cream' : 'text-navy/60'}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-2 block text-[11px] font-extrabold tracking-[0.5px] text-navy/55">
                {c.payTypeLabel}
              </div>
              <div className="mb-[22px] flex gap-2">
                {c.pays.map((o) => {
                  const on = draft.payType === o.id;
                  return (
                    <button
                      type="button"
                      key={o.id}
                      onClick={() => setD({ payType: o.id })}
                      className={`flex-1 rounded-[13px] border-2 px-2 py-[13px] text-[13px] font-extrabold ${on ? 'border-navy bg-navy text-cream' : 'border-navy/15 bg-white text-navy'}`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
              {showMoney && (
                <div className="mb-[18px]">
                  <div className="mb-2.5 block text-[11px] font-extrabold tracking-[0.5px] text-navy/55">
                    {c.amountLabel}
                  </div>
                  <div className="flex items-center gap-[14px] rounded-[14px] border-2 border-navy/15 bg-white px-4 py-3">
                    <button
                      type="button"
                      onClick={amtDown}
                      className="h-[38px] w-[38px] flex-none rounded-[10px] bg-navy/[0.07] text-[18px] text-navy"
                    >
                      <i className="fa fa-minus" />
                    </button>
                    <div className="flex-1 text-center font-mono text-[30px] font-bold text-navy">
                      ${draft.amount}
                    </div>
                    <button
                      type="button"
                      onClick={amtUp}
                      className="h-[38px] w-[38px] flex-none rounded-[10px] bg-accent text-[18px] text-cream"
                    >
                      <i className="fa fa-plus" />
                    </button>
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    {[10, 20, 50, 100].map((v) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => setD({ amount: v })}
                        className="flex-1 rounded-full border-[1.5px] border-navy/15 bg-white py-[9px] text-[12.5px] font-extrabold text-navy/70"
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {showXp && (
                <div>
                  <div className="mb-2.5 block text-[11px] font-extrabold tracking-[0.5px] text-navy/55">
                    {c.xpLabel}
                  </div>
                  <div className="flex items-center gap-[14px] rounded-[14px] border-2 border-navy/15 bg-white px-4 py-3">
                    <button
                      type="button"
                      onClick={xpDown}
                      className="h-[38px] w-[38px] flex-none rounded-[10px] bg-navy/[0.07] text-[18px] text-navy"
                    >
                      <i className="fa fa-minus" />
                    </button>
                    <div className="flex-1 text-center font-mono text-[30px] font-bold text-blue">
                      {draft.xp} XP
                    </div>
                    <button
                      type="button"
                      onClick={xpUp}
                      className="h-[38px] w-[38px] flex-none rounded-[10px] bg-blue text-[18px] text-cream"
                    >
                      <i className="fa fa-plus" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-2 block text-[11px] font-extrabold tracking-[0.5px] text-navy/55">
                {c.assignLabel}
              </div>
              <div className="mb-[22px] flex gap-2.5">
                {kids.map((k) => {
                  const on = draft.assignee === k.id;
                  return (
                    <button
                      type="button"
                      key={k.id}
                      onClick={() => setD({ assignee: k.id })}
                      className={`flex flex-1 items-center gap-[11px] rounded-[14px] border-2 p-[14px] ${on ? 'border-navy bg-navy/[0.05]' : 'border-navy/15 bg-white'}`}
                    >
                      <span
                        className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] text-base font-extrabold text-cream"
                        style={{ background: k.color }}
                      >
                        {k.initial}
                      </span>
                      <div className="text-left">
                        <div className="text-sm font-extrabold text-navy">{k.name}</div>
                        <div className="text-[11.5px] text-navy/60">{c.ageLabel(k.age)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mb-2 block text-[11px] font-extrabold tracking-[0.5px] text-navy/55">
                {c.recurLabel}
              </div>
              <div className="mb-6 flex gap-2">
                {c.recurs.map((o) => {
                  const on = draft.recur === o.id;
                  return (
                    <button
                      type="button"
                      key={o.id}
                      onClick={() => setD({ recur: o.id })}
                      className={`flex-1 rounded-xl border-2 px-1.5 py-3 text-[12.5px] font-extrabold ${on ? 'border-accent bg-accent text-cream' : 'border-navy/15 bg-white text-navy'}`}
                    >
                      <i className={`fa fa-${o.icon} mr-1.5 text-[11px]`} />
                      {o.label}
                    </button>
                  );
                })}
              </div>
              <div className="rounded-2xl bg-navy p-[18px] text-cream">
                <div className="mb-3 text-[10px] font-extrabold tracking-[0.6px] text-teal">
                  {c.summaryLabel}
                </div>
                <div className="flex items-center gap-[13px]">
                  <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[13px] bg-teal/20">
                    <i className={`fa fa-${draft.icon} text-[20px] text-teal`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-extrabold">
                      {draft.name.trim() || c.stepTitles[0]}
                    </div>
                    <div className="text-xs text-teal/85">
                      {sumKid.name} · {c.recurLabels[draft.recur]}
                    </div>
                  </div>
                  <span className="font-mono text-base font-bold text-accent">{summaryReward}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex gap-[11px] border-t border-navy/[0.08] bg-canvas px-[26px] pb-[22px] pt-[14px]">
          <button
            type="button"
            onClick={stepBack}
            className="rounded-[13px] border-2 border-navy/15 bg-white px-5 py-[14px] text-sm font-extrabold text-navy/70"
          >
            {c.back}
          </button>
          <button
            type="button"
            onClick={stepNext}
            className="inline-flex flex-1 items-center justify-center gap-[9px] rounded-[13px] bg-accent py-[14px] text-[14.5px] font-extrabold text-cream"
          >
            {step === 3 ? c.create : c.next}
            <i className={`fa fa-${step === 3 ? 'check' : 'arrow-right'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
