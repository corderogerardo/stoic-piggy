import { zodResolver } from '@hookform/resolvers/zod';
import { type FieldValues, type UseFormProps, type UseFormReturn, useForm } from 'react-hook-form';
import type { z } from 'zod';

/**
 * Thin wrapper over `useForm` that wires a Zod schema as the resolver. Field
 * values are the schema *input* (what the user types — strings for numeric
 * fields); `handleSubmit` receives the validated/coerced *output*. Mode is
 * `onTouched` so errors appear after a field is left and the submit button can
 * gate on `formState.isValid`.
 */
export function useZodForm<TSchema extends z.ZodType<unknown, FieldValues>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.input<TSchema>, unknown, z.output<TSchema>>, 'resolver'>,
): UseFormReturn<z.input<TSchema>, unknown, z.output<TSchema>> {
  return useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    mode: 'onTouched',
    ...options,
    resolver: zodResolver(schema),
  });
}
