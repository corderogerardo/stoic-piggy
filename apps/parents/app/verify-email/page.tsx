'use client';

import { Piggy } from '@stoicpiggy/ui';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';

type State = 'verifying' | 'success' | 'error' | 'missing';

const COPY: Record<State, { title: string; sub: string }> = {
  verifying: { title: 'Verificando…', sub: 'Un momento mientras confirmamos tu correo.' },
  success: { title: '¡Correo verificado!', sub: 'Tu cuenta está lista. Ya puedes continuar.' },
  error: {
    title: 'Enlace no válido',
    sub: 'Este enlace de verificación expiró o ya se usó. Pide uno nuevo desde el panel.',
  },
  missing: { title: 'Falta el código', sub: 'Abre el enlace completo desde tu correo.' },
};

/** Landing page for the email-verification link: redeems `?token=` and reports the result. */
export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const [state, setState] = useState<State>('verifying');
  // Redeem exactly once (the token is single-use; React strict mode runs effects twice).
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setState('missing');
      return;
    }
    verifyEmail(token)
      .then(() => setState('success'))
      .catch(() => setState('error'));
  }, [verifyEmail]);

  const c = COPY[state];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-canvas px-5 py-10 text-navy">
      <div className="w-full max-w-[400px] text-center">
        <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
          <Piggy
            mood={state === 'success' ? 'happy' : state === 'error' ? 'thinking' : 'zen'}
            size={44}
          />
        </span>
        <h1 className="m-0 text-2xl font-extrabold tracking-[-0.5px]">{c.title}</h1>
        <p className="m-0 mt-2 text-[14px] text-navy/60">{c.sub}</p>

        {state !== 'verifying' && (
          <a
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-[13px] bg-accent px-6 py-[13px] text-[15px] font-extrabold text-cream"
          >
            Ir al panel
          </a>
        )}
      </div>
    </div>
  );
}
