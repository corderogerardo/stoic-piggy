'use client';

import type {
  LoginParentInput,
  RegisterParentInput,
  RequestPasswordResetInput,
} from '@stoicpiggy/schemas';
import {
  loginParentSchema,
  registerParentSchema,
  requestPasswordResetSchema,
} from '@stoicpiggy/schemas';
import type { Lang } from '@/lib/content';
import { LANDING_URL } from '../../lib/links';
import { Field, FormError } from './Field';
import { useZodForm } from './useZodForm';

const submitBtn =
  'mt-1.5 inline-flex items-center justify-center gap-2 rounded-[13px] bg-accent py-[14px] text-[15px] font-extrabold text-cream disabled:opacity-60';

const es = (lang: Lang) => lang === 'es';

/** Parent email + password sign-in. Login keeps `password.min(1)` (never block on length). */
export function ParentLoginForm({
  serverError,
  lang,
  onForgot,
  onSubmit,
}: {
  serverError?: string | null;
  lang: Lang;
  onForgot: () => void;
  onSubmit: (values: LoginParentInput) => Promise<void>;
}) {
  const { register, handleSubmit, formState } = useZodForm(loginParentSchema, {
    defaultValues: { email: '', password: '' },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Field
        label="EMAIL"
        type="email"
        placeholder={es(lang) ? 'tucorreo@ejemplo.com' : 'your@email.com'}
        autoComplete="email"
        registration={register('email')}
        error={formState.errors.email}
      />
      <Field
        label={es(lang) ? 'CONTRASEÑA' : 'PASSWORD'}
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        registration={register('password')}
        error={formState.errors.password}
      />
      <button
        type="button"
        onClick={onForgot}
        className="self-start text-[12.5px] font-extrabold text-accent"
      >
        {es(lang) ? '¿Olvidaste tu contraseña?' : 'Forgot your password?'}
      </button>
      <FormError>{serverError}</FormError>
      <button type="submit" disabled={formState.isSubmitting} className={submitBtn}>
        {formState.isSubmitting
          ? es(lang)
            ? 'Un momento…'
            : 'One moment…'
          : es(lang)
            ? 'Entrar'
            : 'Sign in'}
      </button>
    </form>
  );
}

/** Parent sign-up: name + email + a strong (min 8) password. */
export function ParentRegisterForm({
  serverError,
  lang,
  onSubmit,
}: {
  serverError?: string | null;
  lang: Lang;
  onSubmit: (values: RegisterParentInput) => Promise<void>;
}) {
  const { register, handleSubmit, formState } = useZodForm(registerParentSchema, {
    defaultValues: { displayName: '', email: '', password: '' },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Field
        label={es(lang) ? 'NOMBRE' : 'NAME'}
        placeholder={es(lang) ? 'Tu nombre' : 'Your name'}
        autoComplete="name"
        registration={register('displayName')}
        error={formState.errors.displayName}
      />
      <Field
        label="EMAIL"
        type="email"
        placeholder={es(lang) ? 'tucorreo@ejemplo.com' : 'your@email.com'}
        autoComplete="email"
        registration={register('email')}
        error={formState.errors.email}
      />
      <Field
        label={es(lang) ? 'CONTRASEÑA' : 'PASSWORD'}
        type="password"
        placeholder={es(lang) ? 'Mínimo 8 caracteres' : 'At least 8 characters'}
        autoComplete="new-password"
        registration={register('password')}
        error={formState.errors.password}
      />
      <FormError>{serverError}</FormError>
      <button type="submit" disabled={formState.isSubmitting} className={submitBtn}>
        {formState.isSubmitting
          ? es(lang)
            ? 'Un momento…'
            : 'One moment…'
          : es(lang)
            ? 'Crear cuenta'
            : 'Create account'}
      </button>
      {/* COPPA consent vector: creating the account (and later each child profile)
          is the parent's verifiable consent. Surface the legal docs at that moment. */}
      <p className="mt-1 text-center text-[11.5px] leading-[1.5] text-navy/55">
        {es(lang) ? (
          <>
            Al crear una cuenta, y al crear el perfil de cada hijo, aceptas nuestros{' '}
            <a
              href={`${LANDING_URL}/terms`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-accent underline"
            >
              Términos
            </a>{' '}
            y la{' '}
            <a
              href={`${LANDING_URL}/privacy`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-accent underline"
            >
              Política de privacidad
            </a>
            , y das tu consentimiento como madre/padre para el tratamiento de los datos de tus
            hijos.
          </>
        ) : (
          <>
            By creating an account, and each child profile, you agree to our{' '}
            <a
              href={`${LANDING_URL}/terms`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-accent underline"
            >
              Terms
            </a>{' '}
            and{' '}
            <a
              href={`${LANDING_URL}/privacy`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-accent underline"
            >
              Privacy Policy
            </a>
            , and give parental consent for processing your children's data.
          </>
        )}
      </p>
    </form>
  );
}

/** Forgot-password: just an email. The screen always shows an OK confirmation. */
export function ForgotPasswordForm({
  serverError,
  lang,
  onSubmit,
}: {
  serverError?: string | null;
  lang: Lang;
  onSubmit: (values: RequestPasswordResetInput) => Promise<void>;
}) {
  const { register, handleSubmit, formState } = useZodForm(requestPasswordResetSchema, {
    defaultValues: { email: '' },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Field
        label="EMAIL"
        type="email"
        placeholder={es(lang) ? 'tucorreo@ejemplo.com' : 'your@email.com'}
        autoComplete="email"
        registration={register('email')}
        error={formState.errors.email}
      />
      <FormError>{serverError}</FormError>
      <button type="submit" disabled={formState.isSubmitting} className={submitBtn}>
        {formState.isSubmitting
          ? es(lang)
            ? 'Un momento…'
            : 'One moment…'
          : es(lang)
            ? 'Enviar enlace'
            : 'Send link'}
      </button>
    </form>
  );
}
