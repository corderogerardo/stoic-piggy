'use client';

import { Piggy } from '@stoicpiggy/ui';
import { type FormEvent, useState } from 'react';
import { useAuth } from '@/lib/auth';

type Mode = 'login' | 'register' | 'forgot';

/** Full-screen login / sign-up / forgot-password gate for parents. */
export function AuthScreen() {
  const { login, register, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const go = (next: Mode) => {
    setMode(next);
    setError(null);
    setForgotSent(false);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else if (mode === 'register') await register(email, password, displayName);
      else {
        await requestPasswordReset(email);
        setForgotSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const tabBtn = (active: boolean) =>
    `flex-1 rounded-lg py-2.5 text-[13px] font-extrabold tracking-[0.3px] ${active ? 'bg-accent text-cream' : 'bg-transparent text-navy/60'}`;
  const input =
    'w-full rounded-[13px] border-2 border-navy/15 bg-white px-4 py-[13px] text-[15px] font-semibold text-navy outline-none focus:border-accent';

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-canvas px-5 py-10 text-navy">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
            <Piggy mood="zen" size={44} />
          </span>
          <h1 className="m-0 text-2xl font-extrabold tracking-[-0.5px]">Stoic Piggy</h1>
          <p className="m-0 mt-1 text-[13.5px] text-navy/60">Panel de padres</p>
        </div>

        <div className="rounded-[22px] border border-navy/10 bg-white p-6 shadow-[0_20px_60px_rgba(11,19,32,0.08)]">
          {mode === 'forgot' ? (
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="m-0 text-[17px] font-extrabold">Recuperar contraseña</h2>
                <p className="m-0 mt-1 text-[13px] text-navy/60">
                  Te enviaremos un enlace para crear una nueva contraseña.
                </p>
              </div>

              {forgotSent ? (
                <>
                  <div
                    role="status"
                    className="rounded-[11px] bg-teal/15 px-3.5 py-2.5 text-[13px] font-semibold text-navy"
                  >
                    Si existe una cuenta con ese correo, te enviamos un enlace. Revisa tu bandeja de
                    entrada.
                  </div>
                  <button
                    type="button"
                    onClick={() => go('login')}
                    className="mt-1 text-[13px] font-extrabold text-accent"
                  >
                    Volver a iniciar sesión
                  </button>
                </>
              ) : (
                <form onSubmit={submit} className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-extrabold tracking-[0.5px] text-navy/55">
                      EMAIL
                    </span>
                    <input
                      className={input}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      autoComplete="email"
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

                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-1.5 inline-flex items-center justify-center rounded-[13px] bg-accent py-[14px] text-[15px] font-extrabold text-cream disabled:opacity-60"
                  >
                    {busy ? 'Un momento…' : 'Enviar enlace'}
                  </button>
                  <button
                    type="button"
                    onClick={() => go('login')}
                    className="text-[13px] font-extrabold text-navy/55"
                  >
                    Volver a iniciar sesión
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              <div className="mb-5 flex gap-1.5 rounded-[12px] bg-navy/[0.05] p-1">
                <button
                  type="button"
                  onClick={() => go('login')}
                  className={tabBtn(mode === 'login')}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => go('register')}
                  className={tabBtn(mode === 'register')}
                >
                  Crear cuenta
                </button>
              </div>

              <form onSubmit={submit} className="flex flex-col gap-3">
                {mode === 'register' && (
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-extrabold tracking-[0.5px] text-navy/55">
                      NOMBRE
                    </span>
                    <input
                      className={input}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Tu nombre"
                      autoComplete="name"
                      required
                    />
                  </label>
                )}
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-extrabold tracking-[0.5px] text-navy/55">
                    EMAIL
                  </span>
                  <input
                    className={input}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-extrabold tracking-[0.5px] text-navy/55">
                    CONTRASEÑA
                  </span>
                  <input
                    className={input}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    minLength={mode === 'register' ? 8 : undefined}
                    required
                  />
                </label>

                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => go('forgot')}
                    className="self-start text-[12.5px] font-extrabold text-accent"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-[11px] bg-accent/10 px-3.5 py-2.5 text-[13px] font-semibold text-accent"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-1.5 inline-flex items-center justify-center gap-2 rounded-[13px] bg-accent py-[14px] text-[15px] font-extrabold text-cream disabled:opacity-60"
                >
                  {busy ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-[12.5px] text-navy/50">
          Demo: patricia@stoicpiggy.dev · piggy1234
        </p>
      </div>
    </div>
  );
}
