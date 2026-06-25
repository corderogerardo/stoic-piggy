'use client';

import type { ResetPasswordFormValues } from '@stoicpiggy/schemas';
import { Piggy } from '@stoicpiggy/ui';
import { useEffect, useState } from 'react';
import { ResetPasswordForm } from '@/components/form/ResetPasswordForm';
import { useAuth } from '@/lib/auth';

/** Landing page for the password-reset link: takes `?token=` + a new password. */
export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token'));
    setReady(true);
  }, []);

  const onSubmit = async ({ password }: ResetPasswordFormValues) => {
    if (!token) return;
    setError(null);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo restablecer la contraseña. Inténtalo de nuevo.',
      );
    }
  };

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
            <ResetPasswordForm serverError={error} onSubmit={onSubmit} />
          )}
        </div>
      </div>
    </div>
  );
}
