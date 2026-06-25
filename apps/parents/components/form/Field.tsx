'use client';

import type { ComponentProps, ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export const inputClass =
  'w-full rounded-[13px] border-2 border-navy/15 bg-white px-4 py-[13px] text-[15px] font-semibold text-navy outline-none focus:border-accent';
export const labelClass = 'text-[11px] font-extrabold tracking-[0.5px] text-navy/55';

type FieldProps = {
  label: string;
  // Structural — accepts RHF's FieldError as well as the Merge<…> error type it
  // produces for coerced/preprocessed fields. We only ever read `message`.
  error?: { message?: string };
  registration: UseFormRegisterReturn;
  /** Extra classes for the wrapping <label> (e.g. column widths in a row). */
  wrapperClassName?: string;
} & Omit<ComponentProps<'input'>, 'name' | 'className'>;

/** A labeled `<input>` bound to RHF via `register(...)`, with an inline error. */
export function Field({ label, error, registration, wrapperClassName, ...inputProps }: FieldProps) {
  return (
    <label className={`flex flex-col gap-1.5 ${wrapperClassName ?? ''}`}>
      <span className={labelClass}>{label}</span>
      <input
        className={`${inputClass} ${error ? '!border-accent' : ''}`}
        aria-invalid={error ? true : undefined}
        {...inputProps}
        {...registration}
      />
      {error?.message && (
        <span role="alert" className="text-[12.5px] font-semibold text-accent">
          {error.message}
        </span>
      )}
    </label>
  );
}

/** The shared red server-error box (tRPC/mutation failures). Renders nothing when empty. */
export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="rounded-[11px] bg-accent/10 px-3.5 py-2.5 text-[13px] font-semibold text-accent"
    >
      {children}
    </div>
  );
}
