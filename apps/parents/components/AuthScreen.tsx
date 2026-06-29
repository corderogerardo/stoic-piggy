'use client';

import type {
  LoginParentInput,
  RegisterParentInput,
  RequestPasswordResetInput,
} from '@stoicpiggy/schemas';
import { Piggy } from '@stoicpiggy/ui';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import type { Lang } from '@/lib/content';
import { ForgotPasswordForm, ParentLoginForm, ParentRegisterForm } from './form/AuthForms';

type Mode = 'login' | 'register' | 'forgot';

const S = {
  es: {
    subtitle: 'Panel de padres',
    tabLogin: 'Iniciar sesión',
    tabRegister: 'Crear cuenta',
    forgotTitle: 'Recuperar contraseña',
    forgotSub: 'Te enviaremos un enlace para crear una nueva contraseña.',
    forgotSent:
      'Si existe una cuenta con ese correo, te enviamos un enlace. Revisa tu bandeja de entrada.',
    backToLogin: 'Volver a iniciar sesión',
    genericError: 'Algo salió mal. Intenta de nuevo.',
  },
  en: {
    subtitle: 'Parents dashboard',
    tabLogin: 'Sign in',
    tabRegister: 'Create account',
    forgotTitle: 'Reset your password',
    forgotSub: "We'll send you a link to create a new password.",
    forgotSent: 'If an account with that email exists, we sent a link. Check your inbox.',
    backToLogin: 'Back to sign in',
    genericError: 'Something went wrong. Try again.',
  },
};

/** Full-screen login / sign-up / forgot-password gate for parents. */
export function AuthScreen() {
  const { login, register, requestPasswordReset } = useAuth();
  const [lang, setLang] = useState<Lang>('es');
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  // Arriving from the landing "Empezar gratis" CTA (?signup) opens sign-up directly.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('signup')) setMode('register');
  }, []);

  const go = (next: Mode) => {
    setMode(next);
    setError(null);
    setForgotSent(false);
  };

  const c = S[lang];

  const fail = (err: unknown) => setError(err instanceof Error ? err.message : c.genericError);

  // The forms own field state + validation; the screen owns the auth mutations.
  const onLogin = async ({ email, password }: LoginParentInput) => {
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      fail(err);
    }
  };
  const onRegister = async ({ email, password, displayName }: RegisterParentInput) => {
    setError(null);
    try {
      await register(email, password, displayName);
    } catch (err) {
      fail(err);
    }
  };
  const onForgot = async ({ email }: RequestPasswordResetInput) => {
    setError(null);
    try {
      await requestPasswordReset(email);
      setForgotSent(true);
    } catch (err) {
      fail(err);
    }
  };

  const tabBtn = (active: boolean) =>
    `flex-1 rounded-lg py-2.5 text-[13px] font-extrabold tracking-[0.3px] ${active ? 'bg-accent text-cream' : 'bg-transparent text-navy/60'}`;

  const langBtn = (active: boolean) =>
    `rounded-[8px] px-3 py-1.5 text-[11px] font-extrabold tracking-[0.5px] ${active ? 'bg-navy text-cream' : 'bg-transparent text-navy/50'}`;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-canvas px-5 py-10 text-navy">
      <div className="w-full max-w-[400px]">
        <div className="mb-4 flex justify-end">
          <div className="flex gap-0.5 rounded-[11px] bg-navy/[0.07] p-[3px]">
            <button type="button" onClick={() => setLang('es')} className={langBtn(lang === 'es')}>
              ES
            </button>
            <button type="button" onClick={() => setLang('en')} className={langBtn(lang === 'en')}>
              EN
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
            <Piggy mood="zen" size={44} />
          </span>
          <h1 className="m-0 text-2xl font-extrabold tracking-[-0.5px]">Stoic Piggy</h1>
          <p className="m-0 mt-1 text-[13.5px] text-navy/60">{c.subtitle}</p>
        </div>

        <div className="rounded-[22px] border border-navy/10 bg-white p-6 shadow-[0_20px_60px_rgba(11,19,32,0.08)]">
          {mode === 'forgot' ? (
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="m-0 text-[17px] font-extrabold">{c.forgotTitle}</h2>
                <p className="m-0 mt-1 text-[13px] text-navy/60">{c.forgotSub}</p>
              </div>

              {forgotSent ? (
                <>
                  <div
                    role="status"
                    className="rounded-[11px] bg-teal/15 px-3.5 py-2.5 text-[13px] font-semibold text-navy"
                  >
                    {c.forgotSent}
                  </div>
                  <button
                    type="button"
                    onClick={() => go('login')}
                    className="mt-1 text-[13px] font-extrabold text-accent"
                  >
                    {c.backToLogin}
                  </button>
                </>
              ) : (
                <>
                  <ForgotPasswordForm serverError={error} lang={lang} onSubmit={onForgot} />
                  <button
                    type="button"
                    onClick={() => go('login')}
                    className="text-[13px] font-extrabold text-navy/55"
                  >
                    {c.backToLogin}
                  </button>
                </>
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
                  {c.tabLogin}
                </button>
                <button
                  type="button"
                  onClick={() => go('register')}
                  className={tabBtn(mode === 'register')}
                >
                  {c.tabRegister}
                </button>
              </div>

              {mode === 'login' ? (
                <ParentLoginForm
                  serverError={error}
                  lang={lang}
                  onForgot={() => go('forgot')}
                  onSubmit={onLogin}
                />
              ) : (
                <ParentRegisterForm serverError={error} lang={lang} onSubmit={onRegister} />
              )}
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
