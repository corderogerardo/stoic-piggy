'use client';

import { useCreateChild, useTRPC } from '@stoicpiggy/api';
import { createChildAccountSchema } from '@stoicpiggy/shared';
import { useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';

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

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);

    const parsed = createChildAccountSchema.safeParse({
      displayName,
      username,
      password,
      age: age ? Number(age) : undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the form and try again.');
      return;
    }

    try {
      await createChild.mutateAsync(parsed.data);
      await queryClient.invalidateQueries({ queryKey: trpc.children.dashboard.queryKey() });
      await queryClient.invalidateQueries({ queryKey: trpc.children.list.queryKey() });
      setDone(t.ok(parsed.data.displayName));
      onCreated?.(parsed.data.displayName);
      setDisplayName('');
      setUsername('');
      setPassword('');
      setAge('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account.');
    }
  };

  const input =
    'w-full rounded-[13px] border-2 border-navy/15 bg-white px-4 py-3 text-[15px] font-semibold text-navy outline-none focus:border-accent';
  const label = 'text-[11px] font-extrabold tracking-[0.5px] text-navy/55';

  return (
    <div className="rounded-[22px] border border-navy/10 bg-white p-6">
      <h2 className="m-0 text-[17px] font-extrabold">{t.title}</h2>
      <p className="m-0 mb-5 mt-1 text-[13.5px] text-navy/60">{t.sub}</p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <label className="flex min-w-[160px] flex-1 flex-col gap-1.5">
            <span className={label}>{t.name}</span>
            <input
              className={input}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t.namePh}
              required
            />
          </label>
          <label className="flex w-[120px] flex-col gap-1.5">
            <span className={label}>{t.age}</span>
            <input
              className={input}
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              placeholder="10"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className={label}>{t.user}</span>
          <input
            className={input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t.userPh}
            autoComplete="off"
            required
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={label}>{t.pass}</span>
          <input
            className={input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passPh}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        {error && (
          <div
            role="alert"
            className="rounded-[11px] bg-accent/10 px-3.5 py-2.5 text-[13px] font-semibold text-accent"
          >
            {error}
          </div>
        )}
        {done && (
          <div className="rounded-[11px] bg-success/15 px-3.5 py-2.5 text-[13px] font-semibold text-success">
            {done}
          </div>
        )}

        <button
          type="submit"
          disabled={createChild.isPending}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-[13px] bg-accent py-[14px] text-[15px] font-extrabold text-cream disabled:opacity-60"
        >
          {createChild.isPending ? t.busy : t.submit}
        </button>
      </form>
    </div>
  );
}
