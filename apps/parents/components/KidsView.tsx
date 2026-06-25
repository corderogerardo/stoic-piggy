'use client';

import {
  useDeleteChild,
  useMyDashboard,
  useResetKidPassword,
  useSetChildActive,
  useTRPC,
  useUpdateAllowance,
  useUpdateChild,
} from '@stoicpiggy/api';
import type { EditKidFormValues, ResetPasswordFormValues } from '@stoicpiggy/schemas';
import {
  allowanceFormSchema,
  editKidFormSchema,
  resetPasswordFormSchema,
} from '@stoicpiggy/schemas';
import { centsToDollars, type DashboardChild, dollarsToCents } from '@stoicpiggy/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { CreateKidForm } from './CreateKidForm';
import { Field, FormError } from './form/Field';
import { useZodForm } from './form/useZodForm';

type Lang = 'es' | 'en';

const PALETTE = ['#E63946', '#457B9D', '#1D3557', '#2FAE6B', '#E9A23B'];
const colorFor = (i: number) => PALETTE[i % PALETTE.length] ?? '#E63946';

const T = {
  es: {
    yourKids: 'Cuentas de tus hijos',
    loading: 'Cargando…',
    error: 'No pudimos cargar a tus hijos. Reintenta en un momento.',
    empty: 'Aún no has creado ninguna cuenta. Usa el formulario de arriba para empezar.',
    deactivated: 'Cuentas desactivadas',
    balance: 'AHORRADO',
    age: (n: number) => `${n} años`,
    level: 'Nivel',
    noAge: 'Edad no definida',
    savingsGoal: 'META DE AHORRO',
    noGoal: 'Sin meta de ahorro',
    toGo: (n: number, p: number) => `Faltan $${n} · ${p}% logrado`,
    allowance: 'MESADA SEMANAL',
    autopayOn: 'Se marcará para depósito automático (próximamente).',
    autopayOff: 'Mesada automática desactivada.',
    save: 'Guardar',
    saving: 'Guardando…',
    saved: 'Guardado',
    edit: 'Editar',
    resetPw: 'Contraseña',
    deactivate: 'Desactivar',
    reactivate: 'Reactivar',
    del: 'Eliminar',
    // modal
    editTitle: (n: string) => `Editar a ${n}`,
    name: 'NOMBRE',
    ageLabel: 'EDAD (opcional)',
    pwTitle: (n: string) => `Nueva contraseña para ${n}`,
    pwLabel: 'CONTRASEÑA',
    pwPh: 'Mínimo 8 caracteres',
    delTitle: (n: string) => `¿Eliminar a ${n}?`,
    delBody:
      'Esto borra de forma permanente su cuenta, ahorros, metas y tareas. No se puede deshacer.',
    cancel: 'Cancelar',
    confirmDelete: 'Sí, eliminar',
    ok: '¡Listo!',
  },
  en: {
    yourKids: "Your kids' accounts",
    loading: 'Loading…',
    error: "We couldn't load your kids. Try again in a moment.",
    empty: 'You haven’t created any accounts yet. Use the form above to get started.',
    deactivated: 'Deactivated accounts',
    balance: 'SAVED',
    age: (n: number) => `Age ${n}`,
    level: 'Level',
    noAge: 'Age not set',
    savingsGoal: 'SAVINGS GOAL',
    noGoal: 'No savings goal',
    toGo: (n: number, p: number) => `$${n} to go · ${p}% there`,
    allowance: 'WEEKLY ALLOWANCE',
    autopayOn: 'Will be flagged for auto-deposit (coming soon).',
    autopayOff: 'Auto allowance is off.',
    save: 'Save',
    saving: 'Saving…',
    saved: 'Saved',
    edit: 'Edit',
    resetPw: 'Password',
    deactivate: 'Deactivate',
    reactivate: 'Reactivate',
    del: 'Delete',
    editTitle: (n: string) => `Edit ${n}`,
    name: 'NAME',
    ageLabel: 'AGE (optional)',
    pwTitle: (n: string) => `New password for ${n}`,
    pwLabel: 'PASSWORD',
    pwPh: 'At least 8 characters',
    delTitle: (n: string) => `Delete ${n}?`,
    delBody:
      'This permanently removes their account, savings, goals and tasks. It cannot be undone.',
    cancel: 'Cancel',
    confirmDelete: 'Yes, delete',
    ok: 'Done!',
  },
} as const;

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`relative h-7 w-[50px] flex-none rounded-full transition-colors ${on ? 'bg-accent' : 'bg-navy/20'}`}
    >
      <span
        className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-all ${on ? 'left-[25px]' : 'left-[3px]'}`}
      />
    </button>
  );
}

type ManageMode = 'edit' | 'password' | 'delete';

export function KidsView({ lang }: { lang: Lang }) {
  const t = T[lang];
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const dash = useMyDashboard();
  const [manage, setManage] = useState<{ mode: ManageMode; kid: DashboardChild } | null>(null);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: trpc.children.dashboard.queryKey() });
    await queryClient.invalidateQueries({ queryKey: trpc.children.list.queryKey() });
  };

  const all = dash.data ?? [];
  const active = all.filter((k) => k.active);
  const deactivated = all.filter((k) => !k.active);

  return (
    <div className="flex flex-col gap-4">
      <CreateKidForm lang={lang} onCreated={refresh} />

      {dash.isPending && <p className="px-1 text-[13.5px] text-navy/55">{t.loading}</p>}
      {dash.isError && (
        <p className="rounded-[14px] bg-accent/10 px-4 py-3 text-[13.5px] font-semibold text-accent">
          {t.error}
        </p>
      )}
      {!dash.isPending && !dash.isError && all.length === 0 && (
        <p className="px-1 text-[13.5px] text-navy/55">{t.empty}</p>
      )}

      {active.map((k, i) => (
        <KidCard
          key={k.id}
          kid={k}
          color={colorFor(i)}
          lang={lang}
          onManage={(mode) => setManage({ mode, kid: k })}
          afterChange={refresh}
        />
      ))}

      {deactivated.length > 0 && (
        <>
          <div className="mt-2 px-1 text-[11px] font-extrabold tracking-[0.5px] text-navy/45">
            {t.deactivated.toUpperCase()}
          </div>
          {deactivated.map((k) => (
            <DeactivatedRow
              key={k.id}
              kid={k}
              lang={lang}
              onDelete={() => setManage({ mode: 'delete', kid: k })}
              afterChange={refresh}
            />
          ))}
        </>
      )}

      {manage && (
        <ManageModal
          mode={manage.mode}
          kid={manage.kid}
          lang={lang}
          close={() => setManage(null)}
          afterChange={refresh}
        />
      )}
    </div>
  );
}

function KidCard({
  kid,
  color,
  lang,
  onManage,
  afterChange,
}: {
  kid: DashboardChild;
  color: string;
  lang: Lang;
  onManage: (mode: ManageMode) => void;
  afterChange: () => Promise<void> | void;
}) {
  const t = T[lang];
  const updateAllowance = useUpdateAllowance();
  const setActive = useSetChildActive();
  const { control, handleSubmit, reset, getValues, watch, formState } = useZodForm(
    allowanceFormSchema,
    {
      defaultValues: {
        dollars: String(Math.round(centsToDollars(kid.allowanceCents))),
        autopayEnabled: kid.autopayEnabled,
      },
    },
  );
  const autopay = watch('autopayEnabled');
  const [savedFlash, setSavedFlash] = useState(false);

  const balance = Math.round(centsToDollars(kid.balanceCents));
  const goalTarget = kid.goal ? Math.round(centsToDollars(kid.goal.targetCents)) : 0;
  const pct = goalTarget > 0 ? Math.min(100, Math.round((balance / goalTarget) * 100)) : 0;
  const saveAllowance = handleSubmit(async (values) => {
    await updateAllowance.mutateAsync({
      childId: kid.id,
      allowanceCents: dollarsToCents(values.dollars),
      autopayEnabled: values.autopayEnabled,
    });
    await afterChange();
    reset(getValues()); // clear the dirty baseline while keeping the displayed values
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  });

  const initial = (kid.displayName.charAt(0) || '?').toUpperCase();
  const input =
    'w-24 rounded-[11px] border-2 border-navy/15 bg-white px-3 py-2 text-[15px] font-bold text-navy outline-none focus:border-accent';
  const action =
    'rounded-[10px] border border-navy/15 bg-white px-3 py-2 text-[12px] font-extrabold text-navy/70 hover:border-accent hover:text-accent';

  return (
    <div className="rounded-[22px] border border-navy/10 bg-white p-6">
      <div className="mb-[22px] flex flex-wrap items-center gap-4">
        <span
          className="flex h-[58px] w-[58px] flex-none items-center justify-center rounded-2xl text-2xl font-extrabold text-cream"
          style={{ background: color }}
        >
          {initial}
        </span>
        <div className="min-w-[160px] flex-1">
          <div className="text-xl font-extrabold">{kid.displayName}</div>
          <div className="text-[13px] text-navy/60">
            {kid.age ? t.age(kid.age) : t.noAge} · {t.level} {kid.level}
          </div>
        </div>
        <div className="rounded-[14px] bg-navy px-[18px] py-3 text-center text-cream">
          <div className="text-[9.5px] font-extrabold tracking-[0.4px] text-teal">{t.balance}</div>
          <div className="mt-[3px] font-mono text-[22px] font-bold">${balance}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={action} onClick={() => onManage('edit')}>
            {t.edit}
          </button>
          <button type="button" className={action} onClick={() => onManage('password')}>
            {t.resetPw}
          </button>
          <button
            type="button"
            className={action}
            disabled={setActive.isPending}
            onClick={async () => {
              await setActive.mutateAsync({ childId: kid.id, active: false });
              await afterChange();
            }}
          >
            {t.deactivate}
          </button>
          <button
            type="button"
            className="rounded-[10px] border border-accent/30 bg-accent/5 px-3 py-2 text-[12px] font-extrabold text-accent hover:bg-accent/10"
            onClick={() => onManage('delete')}
          >
            {t.del}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-[18px]">
        <div className="flex-[1_1_280px]">
          <div className="mb-[11px] text-[11px] font-extrabold tracking-[0.5px] text-navy/50">
            {t.savingsGoal}
          </div>
          <div className="rounded-2xl bg-canvas p-[18px]">
            {kid.goal ? (
              <>
                <div className="mb-[11px] flex items-center justify-between">
                  <span className="text-[15px] font-extrabold">
                    <i className="fa fa-bullseye mr-[7px] text-accent" />
                    {kid.goal.title}
                  </span>
                  <span className="font-mono text-[13px] font-bold text-navy/60">
                    ${balance} / ${goalTarget}
                  </span>
                </div>
                <div className="mb-2.5 h-2.5 overflow-hidden rounded-full bg-navy/10">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[12.5px] text-navy/60">
                  {t.toGo(Math.max(0, goalTarget - balance), pct)}
                </div>
              </>
            ) : (
              <div className="text-[13px] text-navy/55">{t.noGoal}</div>
            )}
          </div>
        </div>

        <div className="flex-[1_1_280px]">
          <div className="mb-[11px] text-[11px] font-extrabold tracking-[0.5px] text-navy/50">
            {t.allowance}
          </div>
          <div className="rounded-2xl bg-canvas p-[18px]">
            <div className="mb-[14px] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-extrabold text-navy/70">$</span>
                <Controller
                  control={control}
                  name="dollars"
                  render={({ field }) => (
                    <input
                      className={input}
                      inputMode="numeric"
                      aria-label={t.allowance}
                      value={field.value == null ? '' : String(field.value)}
                      onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
              <Controller
                control={control}
                name="autopayEnabled"
                render={({ field }) => (
                  <Toggle on={field.value} onClick={() => field.onChange(!field.value)} />
                )}
              />
            </div>
            <div className="mb-3 text-[12.5px] leading-relaxed text-navy/60">
              {autopay ? t.autopayOn : t.autopayOff}
            </div>
            <button
              type="button"
              disabled={!formState.isDirty || updateAllowance.isPending}
              onClick={saveAllowance}
              className="inline-flex items-center justify-center rounded-[11px] bg-accent px-4 py-2 text-[13px] font-extrabold text-cream disabled:opacity-50"
            >
              {updateAllowance.isPending ? t.saving : savedFlash ? t.saved : t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeactivatedRow({
  kid,
  lang,
  onDelete,
  afterChange,
}: {
  kid: DashboardChild;
  lang: Lang;
  onDelete: () => void;
  afterChange: () => Promise<void> | void;
}) {
  const t = T[lang];
  const setActive = useSetChildActive();
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[16px] border border-navy/10 bg-white/60 px-5 py-4 opacity-80">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-navy/30 text-base font-extrabold text-cream">
        {(kid.displayName.charAt(0) || '?').toUpperCase()}
      </span>
      <div className="flex-1 text-[15px] font-extrabold text-navy/70">{kid.displayName}</div>
      <button
        type="button"
        disabled={setActive.isPending}
        onClick={async () => {
          await setActive.mutateAsync({ childId: kid.id, active: true });
          await afterChange();
        }}
        className="rounded-[10px] bg-accent px-3 py-2 text-[12px] font-extrabold text-cream disabled:opacity-50"
      >
        {t.reactivate}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-[10px] border border-accent/30 bg-accent/5 px-3 py-2 text-[12px] font-extrabold text-accent"
      >
        {t.del}
      </button>
    </div>
  );
}

/** The cancel + primary-action row shared by the manage-kid modal bodies. */
function ModalActions({
  submitLabel,
  cancelLabel,
  busy,
  onCancel,
  onConfirm,
}: {
  submitLabel: string;
  cancelLabel: string;
  busy: boolean;
  onCancel: () => void;
  /** When set, the primary button is a plain button (delete confirm). Otherwise it submits. */
  onConfirm?: () => void;
}) {
  return (
    <div className="mt-5 flex gap-2.5">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-[13px] border-2 border-navy/15 bg-white py-3 text-[14px] font-extrabold text-navy/70"
      >
        {cancelLabel}
      </button>
      <button
        type={onConfirm ? 'button' : 'submit'}
        onClick={onConfirm}
        disabled={busy}
        className="flex-1 rounded-[13px] bg-accent py-3 text-[14px] font-extrabold text-cream disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </div>
  );
}

/** Edit a kid's name + age. */
function EditKidForm({
  kid,
  t,
  serverError,
  onSubmit,
  onCancel,
}: {
  kid: DashboardChild;
  t: (typeof T)[Lang];
  serverError: string | null;
  onSubmit: (values: EditKidFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const { register, handleSubmit, formState } = useZodForm(editKidFormSchema, {
    defaultValues: { displayName: kid.displayName, age: kid.age ? String(kid.age) : '' },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-3">
        <Field
          label={t.name}
          registration={register('displayName')}
          error={formState.errors.displayName}
        />
        <Field
          label={t.ageLabel}
          placeholder="10"
          inputMode="numeric"
          registration={register('age')}
          error={formState.errors.age}
        />
      </div>
      <div className="mt-3">
        <FormError>{serverError}</FormError>
      </div>
      <ModalActions
        submitLabel={t.save}
        cancelLabel={t.cancel}
        busy={formState.isSubmitting}
        onCancel={onCancel}
      />
    </form>
  );
}

/** Set a new password for a kid. */
function ResetKidPasswordForm({
  t,
  serverError,
  onSubmit,
  onCancel,
}: {
  t: (typeof T)[Lang];
  serverError: string | null;
  onSubmit: (values: ResetPasswordFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const { register, handleSubmit, formState } = useZodForm(resetPasswordFormSchema, {
    defaultValues: { password: '' },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field
        label={t.pwLabel}
        type="password"
        placeholder={t.pwPh}
        autoComplete="new-password"
        registration={register('password')}
        error={formState.errors.password}
      />
      <div className="mt-3">
        <FormError>{serverError}</FormError>
      </div>
      <ModalActions
        submitLabel={t.save}
        cancelLabel={t.cancel}
        busy={formState.isSubmitting}
        onCancel={onCancel}
      />
    </form>
  );
}

function ManageModal({
  mode,
  kid,
  lang,
  close,
  afterChange,
}: {
  mode: ManageMode;
  kid: DashboardChild;
  lang: Lang;
  close: () => void;
  afterChange: () => Promise<void> | void;
}) {
  const t = T[lang];
  const updateChild = useUpdateChild();
  const resetPassword = useResetKidPassword();
  const deleteChild = useDeleteChild();
  const [error, setError] = useState<string | null>(null);

  const fail = (err: unknown) =>
    setError(err instanceof Error ? err.message : 'Something went wrong.');

  // The forms own field state + validation; this modal owns the mutations.
  const onEdit = async (values: EditKidFormValues) => {
    setError(null);
    try {
      await updateChild.mutateAsync({
        childId: kid.id,
        displayName: values.displayName,
        age: values.age,
      });
      await afterChange();
      close();
    } catch (err) {
      fail(err);
    }
  };
  const onResetPw = async (values: ResetPasswordFormValues) => {
    setError(null);
    try {
      await resetPassword.mutateAsync({ childId: kid.id, password: values.password });
      await afterChange();
      close();
    } catch (err) {
      fail(err);
    }
  };
  const onDelete = async () => {
    setError(null);
    try {
      await deleteChild.mutateAsync({ childId: kid.id });
      await afterChange();
      close();
    } catch (err) {
      fail(err);
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
      <div
        className="relative w-full max-w-[420px] rounded-[22px] bg-white p-6"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="m-0 mb-4 text-[17px] font-extrabold">
          {mode === 'edit'
            ? t.editTitle(kid.displayName)
            : mode === 'password'
              ? t.pwTitle(kid.displayName)
              : t.delTitle(kid.displayName)}
        </h2>

        {mode === 'edit' && (
          <EditKidForm kid={kid} t={t} serverError={error} onSubmit={onEdit} onCancel={close} />
        )}
        {mode === 'password' && (
          <ResetKidPasswordForm t={t} serverError={error} onSubmit={onResetPw} onCancel={close} />
        )}
        {mode === 'delete' && (
          <>
            <p className="m-0 text-[13.5px] leading-relaxed text-navy/70">{t.delBody}</p>
            <div className="mt-3">
              <FormError>{error}</FormError>
            </div>
            <ModalActions
              submitLabel={t.confirmDelete}
              cancelLabel={t.cancel}
              busy={deleteChild.isPending}
              onCancel={close}
              onConfirm={onDelete}
            />
          </>
        )}
      </div>
    </div>
  );
}
