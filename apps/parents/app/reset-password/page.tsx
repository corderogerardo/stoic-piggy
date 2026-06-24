'use client';

import { Piggy } from '@stoicpiggy/ui';
import { type FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';

/** Landing page for the password-reset link: takes `?token=` + a new password. */
export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token'));
    setReady(true);
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setBusy(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo restablecer la contraseña. Inténtalo de nuevo.',
      );
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full rounded-[13px] border-2 border-navy/15 bg-white px-4 py-[13px] text-[15px] font-semibold text-navy outline-none focus:border-accent';

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-canvas px-5 py-10 text-navy">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
            <Piggy mood={done ? 'happy' : 'zen'} size={44} />
          </span>
          <h1 className="m-0 text-2xl font-extrabold tracking-[-0.5px]">Nueva contraseña</h1>
        </div>

        <div className="rounded-[22px] border border-navy/10 bg-white p-6 shadow-[0_20px_60px_rgba(11,19,32,0.08)]">
          {!ready ? null : done ? (
            <div className="flex flex-col gap-4 text-center">
              <p className="m-0 text-[14px] text-navy/70">
                Tu contraseña se actualizó. Ya puedes iniciar sesión.
              </p>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-[13px] bg-accent py-[14px] text-[15px] font-extrabold text-cream"
              >
                Iniciar sesión
              </a>
            </div>
          ) : !token ? (
            <p role="alert" className="m-0 text-center text-[14px] text-navy/70">
              Falta el código de recuperación. Abre el enlace completo desde tu correo.
            </p>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-extrabold tracking-[0.5px] text-navy/55">
                  NUEVA CONTRASEÑA
                </span>
                <input
                  className={input}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
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

              <button
                type="submit"
                disabled={busy}
                className="mt-1.5 inline-flex items-center justify-center rounded-[13px] bg-accent py-[14px] text-[15px] font-extrabold text-cream disabled:opacity-60"
              >
                {busy ? 'Guardando…' : 'Restablecer contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
