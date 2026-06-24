'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';

type Lang = 'es' | 'en';

const COPY = {
  es: {
    msg: 'Verifica tu correo para asegurar tu cuenta.',
    cta: 'Reenviar correo',
    sending: 'Enviando…',
    sent: '¡Listo! Revisa tu bandeja de entrada.',
    err: 'No se pudo enviar. Inténtalo de nuevo.',
  },
  en: {
    msg: 'Verify your email to secure your account.',
    cta: 'Resend email',
    sending: 'Sending…',
    sent: 'Done! Check your inbox.',
    err: "Couldn't send. Try again.",
  },
} as const;

/** Soft-gate nudge: shown only while the signed-in parent's email is unverified. */
export function VerifyEmailBanner({ lang = 'es' }: { lang?: Lang }) {
  const { parent, resendVerification } = useAuth();
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const c = COPY[lang];

  // Render nothing once verified (or before a parent is loaded).
  if (!parent || parent.emailVerifiedAt) return null;

  const resend = async () => {
    setState('sending');
    try {
      await resendVerification();
      setState('sent');
    } catch {
      setState('error');
    }
  };

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-3 border-b border-accent/20 bg-accent/10 px-[30px] py-3 text-[13px] font-semibold text-navy"
    >
      <i className="fa fa-envelope-o text-accent" aria-hidden />
      <span className="flex-1 min-w-[180px]">
        {state === 'sent' ? c.sent : state === 'error' ? c.err : c.msg}
      </span>
      {state !== 'sent' && (
        <button
          type="button"
          onClick={resend}
          disabled={state === 'sending'}
          className="rounded-lg bg-accent px-3 py-1.5 text-[12px] font-extrabold text-cream disabled:opacity-60"
        >
          {state === 'sending' ? c.sending : c.cta}
        </button>
      )}
    </div>
  );
}
