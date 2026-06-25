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
import { Field, FormError } from './Field';
import { useZodForm } from './useZodForm';

const submitBtn =
  'mt-1.5 inline-flex items-center justify-center gap-2 rounded-[13px] bg-accent py-[14px] text-[15px] font-extrabold text-cream disabled:opacity-60';

/** Parent email + password sign-in. Login keeps `password.min(1)` (never block on length). */
export function ParentLoginForm({
  serverError,
  onForgot,
  onSubmit,
}: {
  serverError?: string | null;
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
        placeholder="tucorreo@ejemplo.com"
        autoComplete="email"
        registration={register('email')}
        error={formState.errors.email}
      />
      <Field
        label="CONTRASEÑA"
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
        ¿Olvidaste tu contraseña?
      </button>
      <FormError>{serverError}</FormError>
      <button type="submit" disabled={formState.isSubmitting} className={submitBtn}>
        {formState.isSubmitting ? 'Un momento…' : 'Entrar'}
      </button>
    </form>
  );
}

/** Parent sign-up: name + email + a strong (min 8) password. */
export function ParentRegisterForm({
  serverError,
  onSubmit,
}: {
  serverError?: string | null;
  onSubmit: (values: RegisterParentInput) => Promise<void>;
}) {
  const { register, handleSubmit, formState } = useZodForm(registerParentSchema, {
    defaultValues: { displayName: '', email: '', password: '' },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Field
        label="NOMBRE"
        placeholder="Tu nombre"
        autoComplete="name"
        registration={register('displayName')}
        error={formState.errors.displayName}
      />
      <Field
        label="EMAIL"
        type="email"
        placeholder="tucorreo@ejemplo.com"
        autoComplete="email"
        registration={register('email')}
        error={formState.errors.email}
      />
      <Field
        label="CONTRASEÑA"
        type="password"
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        registration={register('password')}
        error={formState.errors.password}
      />
      <FormError>{serverError}</FormError>
      <button type="submit" disabled={formState.isSubmitting} className={submitBtn}>
        {formState.isSubmitting ? 'Un momento…' : 'Crear cuenta'}
      </button>
    </form>
  );
}

/** Forgot-password: just an email. The screen always shows an OK confirmation. */
export function ForgotPasswordForm({
  serverError,
  onSubmit,
}: {
  serverError?: string | null;
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
        placeholder="tucorreo@ejemplo.com"
        autoComplete="email"
        registration={register('email')}
        error={formState.errors.email}
      />
      <FormError>{serverError}</FormError>
      <button type="submit" disabled={formState.isSubmitting} className={submitBtn}>
        {formState.isSubmitting ? 'Un momento…' : 'Enviar enlace'}
      </button>
    </form>
  );
}
