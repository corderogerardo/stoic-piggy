'use client';

import { useCreateChild, useTRPC } from '@stoicpiggy/api';
import type { CreateKidFormValues } from '@stoicpiggy/schemas';
import { createKidFormSchema } from '@stoicpiggy/schemas';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Field, FormError } from './form/Field';
import { useZodForm } from './form/useZodForm';

interface Props {
  lang: 'es' | 'en';
  onCreated?: (displayName: string) => void;
}

const T = {
  es: {
    title: 'Crear cuenta de hijo',
    sub: 'Crea un usuario y contraseña para que tu hijo entre en la app.',
    name: 'NOMBRE',
    namePh: 'Nombre del hijo',
    user: 'USUARIO',
    userPh: 'p. ej. marco',
    pass: 'CONTRASEÑA',
    passPh: 'Mínimo 8 caracteres',
    age: 'EDAD (opcional)',
    submit: 'Crear cuenta',
    busy: 'Creando…',
    ok: (n: string) => `¡Listo! ${n} ya puede iniciar sesión.`,
  },
  en: {
    title: 'Create a kid account',
    sub: 'Set a username and password so your kid can sign in to the app.',
    name: 'NAME',
    namePh: "Kid's name",
    user: 'USERNAME',
    userPh: 'e.g. marco',
    pass: 'PASSWORD',
    passPh: 'At least 8 characters',
    age: 'AGE (optional)',
    submit: 'Create account',
    busy: 'Creating…',
    ok: (n: string) => `Done! ${n} can sign in now.`,
  },
} as const;

/** A parent creates a kid's login account. On success refreshes the dashboard. */
export function CreateKidForm({ lang, onCreated }: Props) {
  const t = T[lang];
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const createChild = useCreateChild();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState } = useZodForm(createKidFormSchema, {
    defaultValues: { displayName: '', username: '', password: '', age: '' },
  });
  const { errors, isSubmitting } = formState;

  const onSubmit = async (values: CreateKidFormValues) => {
    setServerError(null);
    setDone(null);
    try {
      await createChild.mutateAsync(values);
      await queryClient.invalidateQueries({ queryKey: trpc.children.dashboard.queryKey() });
      await queryClient.invalidateQueries({ queryKey: trpc.children.list.queryKey() });
      setDone(t.ok(values.displayName));
      onCreated?.(values.displayName);
      reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not create the account.');
    }
  };

  return (
    <div className="rounded-[22px] border border-navy/10 bg-white p-6">
      <h2 className="m-0 text-[17px] font-extrabold">{t.title}</h2>
      <p className="m-0 mb-5 mt-1 text-[13.5px] text-navy/60">{t.sub}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <Field
            label={t.name}
            placeholder={t.namePh}
            wrapperClassName="min-w-[160px] flex-1"
            registration={register('displayName')}
            error={errors.displayName}
          />
          <Field
            label={t.age}
            placeholder="10"
            inputMode="numeric"
            wrapperClassName="w-[120px]"
            registration={register('age')}
            error={errors.age}
          />
        </div>
        <Field
          label={t.user}
          placeholder={t.userPh}
          autoComplete="off"
          registration={register('username')}
          error={errors.username}
        />
        <Field
          label={t.pass}
          type="password"
          placeholder={t.passPh}
          autoComplete="new-password"
          registration={register('password')}
          error={errors.password}
        />

        <FormError>{serverError}</FormError>
        {done && (
          <div className="rounded-[11px] bg-success/15 px-3.5 py-2.5 text-[13px] font-semibold text-success">
            {done}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-[13px] bg-accent py-[14px] text-[15px] font-extrabold text-cream disabled:opacity-60"
        >
          {isSubmitting ? t.busy : t.submit}
        </button>
      </form>
    </div>
  );
}
