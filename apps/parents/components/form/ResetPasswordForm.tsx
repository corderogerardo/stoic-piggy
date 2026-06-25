'use client';

import type { ResetPasswordFormValues } from '@stoicpiggy/schemas';
import { resetPasswordFormSchema } from '@stoicpiggy/schemas';
import { Field, FormError } from './Field';
import { useZodForm } from './useZodForm';

/** New-password form. Owns validation; the page owns the token + reset mutation. */
export function ResetPasswordForm({
  serverError,
  onSubmit,
}: {
  serverError?: string | null;
  onSubmit: (values: ResetPasswordFormValues) => Promise<void>;
}) {
  const { register, handleSubmit, formState } = useZodForm(resetPasswordFormSchema, {
    defaultValues: { password: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Field
        label="NUEVA CONTRASEÑA"
        type="password"
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        registration={register('password')}
        error={formState.errors.password}
      />

      <FormError>{serverError}</FormError>

      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="mt-1.5 inline-flex items-center justify-center rounded-[13px] bg-accent py-[14px] text-[15px] font-extrabold text-cream disabled:opacity-60"
      >
        {formState.isSubmitting ? 'Guardando…' : 'Restablecer contraseña'}
      </button>
    </form>
  );
}
