'use client';

import { useCreateTask, useDeleteTask, useMyDashboard, useTasks, useTRPC } from '@stoicpiggy/api';
import type { CreateTaskFormValues } from '@stoicpiggy/schemas';
import { createTaskFormSchema } from '@stoicpiggy/schemas';
import {
  centsToDollars,
  type DashboardChild,
  dollarsToCents,
  type Task,
  type TaskCategory,
  type TaskRecurrence,
} from '@stoicpiggy/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  filterSuggestions,
  type SuggestionGroup,
  type TaskSuggestion,
} from '../lib/taskSuggestions';
import { FormError } from './form/Field';
import { useZodForm } from './form/useZodForm';

type Lang = 'es' | 'en';

const T = {
  es: {
    title: 'Tareas',
    new: 'Nueva tarea',
    loading: 'Cargando…',
    empty: 'No hay tareas todavía. Crea la primera para uno de tus hijos.',
    noKids: 'Primero crea una cuenta de hijo para poder asignar tareas.',
    colTask: 'TAREA',
    colKid: 'HIJO',
    colRecur: 'FRECUENCIA',
    colReward: 'RECOMPENSA',
    colStatus: 'ESTADO',
    cat: { chore: 'Quehacer', lesson: 'Lección' } as Record<TaskCategory, string>,
    recur: { once: 'Una vez', daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual' } as Record<
      TaskRecurrence,
      string
    >,
    status: {
      active: 'Activa',
      submitted: 'Por aprobar',
      approved: 'Aprobada',
      rejected: 'Rechazada',
    },
    // modal
    name: 'NOMBRE DE LA TAREA',
    namePh: 'p. ej. Sacar la basura',
    assignee: 'ASIGNAR A',
    allKids: 'Todos',
    suggestions: 'SUGERENCIAS',
    groups: { home: 'Casa', study: 'Estudio', homework: 'Tarea escolar', financial: 'Dinero' },
    noSuggestions: 'No hay sugerencias para esta edad.',
    category: 'TIPO',
    pay: 'PAGO',
    money: 'Dinero',
    xp: 'XP',
    both: 'Ambos',
    amount: 'MONTO ($)',
    xpAmount: 'XP',
    frequency: 'FRECUENCIA',
    due: 'FECHA LÍMITE (OPCIONAL)',
    duePrefix: 'Vence',
    create: 'Crear tarea',
    creating: 'Creando…',
    cancel: 'Cancelar',
    del: 'Eliminar',
  },
  en: {
    title: 'Tasks',
    new: 'New task',
    loading: 'Loading…',
    empty: 'No tasks yet. Create the first one for one of your kids.',
    noKids: 'Create a kid account first so you can assign tasks.',
    colTask: 'TASK',
    colKid: 'KID',
    colRecur: 'FREQUENCY',
    colReward: 'REWARD',
    colStatus: 'STATUS',
    cat: { chore: 'Chore', lesson: 'Lesson' } as Record<TaskCategory, string>,
    recur: { once: 'Once', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' } as Record<
      TaskRecurrence,
      string
    >,
    status: {
      active: 'Active',
      submitted: 'To approve',
      approved: 'Approved',
      rejected: 'Rejected',
    },
    name: 'TASK NAME',
    namePh: 'e.g. Take out the trash',
    assignee: 'ASSIGN TO',
    allKids: 'All',
    suggestions: 'SUGGESTIONS',
    groups: { home: 'Home', study: 'Study', homework: 'Homework', financial: 'Money' },
    noSuggestions: 'No suggestions for this age.',
    category: 'TYPE',
    pay: 'PAY',
    money: 'Money',
    xp: 'XP',
    both: 'Both',
    amount: 'AMOUNT ($)',
    xpAmount: 'XP',
    frequency: 'FREQUENCY',
    due: 'DUE DATE (OPTIONAL)',
    duePrefix: 'Due',
    create: 'Create task',
    creating: 'Creating…',
    cancel: 'Cancel',
    del: 'Delete',
  },
} as const;

const PALETTE = ['#E63946', '#457B9D', '#1D3557', '#2FAE6B', '#E9A23B'];

const STATUS_STYLE: Record<Task['status'], string> = {
  active: 'bg-success/15 text-success',
  submitted: 'bg-accent/15 text-accent',
  approved: 'bg-blue/15 text-blue',
  rejected: 'bg-navy/10 text-navy/50',
};

export function rewardLabel(t: Pick<Task, 'payType' | 'amountCents' | 'rewardXp'>): string {
  const money = `$${Math.round(centsToDollars(t.amountCents))}`;
  const xp = `+${t.rewardXp} XP`;
  if (t.payType === 'xp') return xp;
  if (t.payType === 'money') return money;
  return `${money} · ${xp}`;
}

export function TasksView({ lang }: { lang: Lang }) {
  const t = T[lang];
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const tasks = useTasks();
  const dash = useMyDashboard();
  const deleteTask = useDeleteTask();
  const [creating, setCreating] = useState(false);

  const kids = useMemo(() => (dash.data ?? []).filter((k) => k.active), [dash.data]);
  const kidById = useMemo(() => {
    const m = new Map<string, { name: string; color: string }>();
    for (const [i, k] of kids.entries()) {
      m.set(k.id, { name: k.displayName, color: PALETTE[i % PALETTE.length] ?? '#E63946' });
    }
    return m;
  }, [kids]);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: trpc.tasks.listByParent.queryKey() });

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setCreating(true)}
          disabled={kids.length === 0}
          className="inline-flex items-center gap-2 rounded-[11px] border-2 border-navy bg-transparent px-4 py-[9px] text-[13px] font-extrabold text-navy disabled:opacity-40"
        >
          <i className="fa fa-plus" />
          {t.new}
        </button>
      </div>

      {tasks.isPending && <p className="px-1 text-[13.5px] text-navy/55">{t.loading}</p>}
      {!tasks.isPending && (tasks.data?.length ?? 0) === 0 && (
        <p className="px-1 text-[13.5px] text-navy/55">{kids.length === 0 ? t.noKids : t.empty}</p>
      )}

      {(tasks.data?.length ?? 0) > 0 && (
        <div className="overflow-hidden rounded-[20px] border border-navy/10 bg-white">
          <div className="flex items-center gap-[14px] border-b border-navy/[0.08] px-[22px] py-[13px] text-[10.5px] font-extrabold tracking-[0.5px] text-navy/50">
            <span className="flex-1">{t.colTask}</span>
            <span className="w-[130px]">{t.colKid}</span>
            <span className="w-[110px]">{t.colRecur}</span>
            <span className="w-[110px] text-right">{t.colReward}</span>
            <span className="w-[110px] text-right">{t.colStatus}</span>
            <span className="w-[34px]" />
          </div>
          {(tasks.data ?? []).map((task) => {
            const kid = kidById.get(task.childId);
            return (
              <div
                key={task.id}
                className="flex items-center gap-[14px] border-b border-navy/[0.06] px-[22px] py-[15px]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-[13px]">
                  <span
                    className={`flex h-10 w-10 flex-none items-center justify-center rounded-[11px] ${task.category === 'lesson' ? 'bg-blue/20' : 'bg-teal/40'}`}
                  >
                    <i
                      className={`fa fa-${task.category === 'lesson' ? 'graduation-cap' : 'check'} text-base ${task.category === 'lesson' ? 'text-blue' : 'text-accent'}`}
                    />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[14.5px] font-extrabold leading-tight">{task.title}</div>
                    <div className="text-[11.5px] text-navy/55">
                      {t.cat[task.category]}
                      {task.dueAt &&
                        ` · ${t.duePrefix} ${new Date(task.dueAt).toLocaleDateString(lang, {
                          day: 'numeric',
                          month: 'short',
                        })}`}
                    </div>
                  </div>
                </div>
                <div className="flex w-[130px] items-center gap-2">
                  <span
                    className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg text-[11px] font-extrabold text-cream"
                    style={{ background: kid?.color ?? '#1D3557' }}
                  >
                    {(kid?.name.charAt(0) ?? '?').toUpperCase()}
                  </span>
                  <span className="truncate text-[13px] font-semibold">{kid?.name ?? '—'}</span>
                </div>
                <div className="w-[110px] text-xs font-bold text-navy/70">
                  {t.recur[task.recurrence]}
                </div>
                <div className="w-[110px] text-right font-mono text-sm font-bold text-navy">
                  {rewardLabel(task)}
                </div>
                <div className="w-[110px] text-right">
                  <span
                    className={`rounded-full px-[11px] py-[5px] text-[10px] font-extrabold tracking-[0.3px] ${STATUS_STYLE[task.status]}`}
                  >
                    {t.status[task.status]}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={t.del}
                  disabled={deleteTask.isPending}
                  onClick={async () => {
                    await deleteTask.mutateAsync({ taskId: task.id });
                    await refresh();
                  }}
                  className="h-[34px] w-[34px] flex-none rounded-[10px] border border-navy/15 bg-white text-[13px] text-navy/40 hover:border-accent hover:text-accent"
                >
                  <i className="fa fa-trash-o" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {creating && (
        <CreateTaskModal
          lang={lang}
          kids={kids}
          close={() => setCreating(false)}
          afterCreate={refresh}
        />
      )}
    </div>
  );
}

function CreateTaskModal({
  lang,
  kids,
  close,
  afterCreate,
}: {
  lang: Lang;
  kids: DashboardChild[];
  close: () => void;
  afterCreate: () => Promise<void> | void;
}) {
  const t = T[lang];
  const createTask = useCreateTask();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, control, handleSubmit, watch, setValue, formState } = useZodForm(
    createTaskFormSchema,
    {
      defaultValues: {
        childIds: kids[0] ? [kids[0].id] : [],
        title: '',
        category: 'chore',
        payType: 'money',
        amount: '20',
        xp: '50',
        recurrence: 'once',
        dueDate: '',
      },
    },
  );
  const payType = watch('payType');
  const childIds = watch('childIds');

  const [group, setGroup] = useState<SuggestionGroup>('home');
  // Filter suggestions by the kid's age only when a single kid is selected and
  // its age is known; otherwise show every suggestion in the group.
  const selectedAge =
    childIds.length === 1 ? (kids.find((k) => k.id === childIds[0])?.age ?? 0) : 0;
  const suggestions = filterSuggestions(selectedAge, group);

  const applySuggestion = (s: TaskSuggestion) => {
    setValue('title', lang === 'es' ? s.es : s.en, { shouldValidate: true });
    setValue('category', s.category);
    setValue('payType', s.payType);
    setValue('amount', String(s.amount));
    setValue('xp', String(s.xp));
  };

  const input =
    'w-full rounded-[12px] border-2 border-navy/15 bg-white px-3.5 py-2.5 text-[14px] font-semibold text-navy outline-none focus:border-accent';
  const label = 'text-[11px] font-extrabold tracking-[0.5px] text-navy/55';
  const pill = (on: boolean) =>
    `flex-1 rounded-[11px] border-2 px-3 py-2 text-[12.5px] font-extrabold ${on ? 'border-accent bg-accent/5 text-accent' : 'border-navy/15 bg-white text-navy/60'}`;

  const onSubmit = async (values: CreateTaskFormValues) => {
    setServerError(null);
    const base = {
      title: values.title.trim() || (lang === 'es' ? 'Tarea nueva' : 'New task'),
      category: values.category,
      payType: values.payType,
      amountCents: values.payType === 'xp' ? 0 : dollarsToCents(values.amount),
      rewardXp: values.payType === 'money' ? 0 : values.xp,
      recurrence: values.recurrence,
      dueAt: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
    };
    try {
      await Promise.all(
        values.childIds.map((childId) => createTask.mutateAsync({ childId, ...base })),
      );
      await afterCreate();
      close();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not create the task.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
      <button
        type="button"
        aria-label={t.cancel}
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-transparent"
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative flex w-full max-w-[460px] flex-col gap-3 rounded-[22px] bg-white p-6"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="m-0 text-[17px] font-extrabold">{t.new}</h2>

        <label className="flex flex-col gap-1.5">
          <span className={label}>{t.name}</span>
          <input className={input} placeholder={t.namePh} {...register('title')} />
        </label>

        <Controller
          control={control}
          name="childIds"
          render={({ field }) => {
            const allSelected = field.value.length === kids.length && kids.length > 0;
            const toggle = (id: string) =>
              field.value.includes(id)
                ? field.value.length > 1 && field.onChange(field.value.filter((x) => x !== id))
                : field.onChange([...field.value, id]);
            return (
              <div className="flex flex-col gap-1.5">
                <span className={label}>{t.assignee}</span>
                <div className="flex flex-wrap gap-2">
                  {kids.length > 1 && (
                    <button
                      type="button"
                      className={pill(allSelected)}
                      onClick={() =>
                        field.onChange(allSelected ? [kids[0]?.id ?? ''] : kids.map((k) => k.id))
                      }
                    >
                      {t.allKids}
                    </button>
                  )}
                  {kids.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      className={pill(field.value.includes(k.id))}
                      onClick={() => toggle(k.id)}
                    >
                      {k.displayName}
                    </button>
                  ))}
                </div>
              </div>
            );
          }}
        />

        <div className="flex flex-col gap-1.5">
          <span className={label}>{t.suggestions}</span>
          <div className="flex flex-wrap gap-1.5">
            {(['home', 'study', 'homework', 'financial'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroup(g)}
                className={`rounded-full px-3 py-1 text-[11.5px] font-extrabold ${group === g ? 'bg-navy text-cream' : 'bg-navy/[0.07] text-navy/60'}`}
              >
                {t.groups[g]}
              </button>
            ))}
          </div>
          <div className="flex max-h-[120px] flex-wrap gap-1.5 overflow-y-auto">
            {suggestions.length === 0 && (
              <span className="text-[12px] text-navy/45">{t.noSuggestions}</span>
            )}
            {suggestions.map((s) => (
              <button
                key={`${s.group}-${s.en}`}
                type="button"
                onClick={() => applySuggestion(s)}
                className="rounded-[10px] border border-navy/15 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-navy/80 hover:border-accent hover:text-accent"
              >
                {lang === 'es' ? s.es : s.en}
              </button>
            ))}
          </div>
        </div>

        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <span className={label}>{t.category}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={pill(field.value === 'chore')}
                  onClick={() => field.onChange('chore')}
                >
                  {t.cat.chore}
                </button>
                <button
                  type="button"
                  className={pill(field.value === 'lesson')}
                  onClick={() => field.onChange('lesson')}
                >
                  {t.cat.lesson}
                </button>
              </div>
            </div>
          )}
        />

        <Controller
          control={control}
          name="payType"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <span className={label}>{t.pay}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={pill(field.value === 'money')}
                  onClick={() => field.onChange('money')}
                >
                  {t.money}
                </button>
                <button
                  type="button"
                  className={pill(field.value === 'xp')}
                  onClick={() => field.onChange('xp')}
                >
                  {t.xp}
                </button>
                <button
                  type="button"
                  className={pill(field.value === 'both')}
                  onClick={() => field.onChange('both')}
                >
                  {t.both}
                </button>
              </div>
            </div>
          )}
        />

        <div className="flex gap-3">
          {payType !== 'xp' && (
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <label className="flex flex-1 flex-col gap-1.5">
                  <span className={label}>{t.amount}</span>
                  <input
                    className={input}
                    inputMode="numeric"
                    value={field.value == null ? '' : String(field.value)}
                    onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ''))}
                    onBlur={field.onBlur}
                  />
                </label>
              )}
            />
          )}
          {payType !== 'money' && (
            <Controller
              control={control}
              name="xp"
              render={({ field }) => (
                <label className="flex flex-1 flex-col gap-1.5">
                  <span className={label}>{t.xpAmount}</span>
                  <input
                    className={input}
                    inputMode="numeric"
                    value={field.value == null ? '' : String(field.value)}
                    onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ''))}
                    onBlur={field.onBlur}
                  />
                </label>
              )}
            />
          )}
        </div>

        <Controller
          control={control}
          name="recurrence"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <span className={label}>{t.frequency}</span>
              <div className="flex gap-2">
                {(['once', 'daily', 'weekly', 'monthly'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={pill(field.value === r)}
                    onClick={() => field.onChange(r)}
                  >
                    {t.recur[r]}
                  </button>
                ))}
              </div>
            </div>
          )}
        />

        <label className="flex flex-col gap-1.5">
          <span className={label}>{t.due}</span>
          <input type="date" className={input} {...register('dueDate')} />
        </label>

        <FormError>{serverError}</FormError>

        <div className="mt-2 flex gap-2.5">
          <button
            type="button"
            onClick={close}
            className="flex-1 rounded-[12px] border-2 border-navy/15 bg-white py-3 text-[14px] font-extrabold text-navy/70"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="flex-1 rounded-[12px] bg-accent py-3 text-[14px] font-extrabold text-cream disabled:opacity-60"
          >
            {formState.isSubmitting ? t.creating : t.create}
          </button>
        </div>
      </form>
    </div>
  );
}
