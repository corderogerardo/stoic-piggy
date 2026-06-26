import { z } from 'zod';
import {
  createChildAccountSchema,
  passwordSchema,
  taskCategorySchema,
  taskPayTypeSchema,
  taskRecurrenceSchema,
} from './schemas';

/**
 * Form-shaped schemas. These validate what the user actually *types* — digit
 * strings from number inputs, an optional age field, a password-only reset — as
 * opposed to the domain schemas in ./schemas which validate the tRPC wire
 * payload (amounts in cents, server-only ids/tokens). Each screen maps a parsed
 * form value to its domain payload right before the mutation.
 *
 * Number fields use `z.coerce.number()`: a numeric `<input>`/`TextInput` holds a
 * string, so an empty field coerces to 0 (rejected where a positive amount is
 * required, accepted where 0 is a valid floor like allowance).
 */

/** Whole-dollar text field -> integer dollars (0..100k). Empty string -> 0. */
const dollarsField = z.coerce.number().int().min(0).max(100_000);

/** Optional age text field: '' (or absent) -> undefined, otherwise 1..25. */
const ageToUndefined = z.preprocess(
  (v) => (v === '' || v == null ? undefined : Number(v)),
  z.number().int().min(1).max(25).optional(),
);

/** Optional age text field where '' explicitly clears the value -> null. */
const ageToNull = z.preprocess(
  (v) => (v === '' || v == null ? null : Number(v)),
  z.number().int().min(1).max(25).nullable(),
);

/** New-password form: reset-password landing page + a parent resetting a kid's password. */
export const resetPasswordFormSchema = z.object({ password: passwordSchema });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

/** A parent creates a kid account. Reuses the account rules; age typed as a string. */
export const createKidFormSchema = createChildAccountSchema
  .omit({ age: true, avatarUrl: true })
  .extend({ age: ageToUndefined });
/** Parsed/validated output handed to the create mutation (age coerced to a number). */
export type CreateKidFormValues = z.infer<typeof createKidFormSchema>;

/** A parent edits a kid's profile (childId comes from props, not a field). */
export const editKidFormSchema = z.object({
  displayName: z.string().trim().min(1, 'Name is required').max(60),
  age: ageToNull,
});
export type EditKidFormValues = z.infer<typeof editKidFormSchema>;

/** Allowance editor: dollars typed in + autopay toggle. Screen maps dollars -> cents. */
export const allowanceFormSchema = z.object({
  dollars: dollarsField,
  autopayEnabled: z.boolean(),
});
export type AllowanceFormValues = z.infer<typeof allowanceFormSchema>;

/** Create-task modal: dollar/xp amounts typed in; title optional (screen defaults it). */
export const createTaskFormSchema = z.object({
  childId: z.string().min(1, 'Pick a kid'),
  title: z.string().trim().max(120),
  category: taskCategorySchema,
  payType: taskPayTypeSchema,
  // No form-level max on amount/xp: the screen zeroes whichever pay side is
  // hidden, and the server schema (createTaskSchema) enforces the real caps. A
  // form-level cap would let an over-cap value left in a *hidden* field
  // (RHF retains unmounted values) silently block submit with no visible error.
  amount: z.coerce.number().int().min(0),
  xp: z.coerce.number().int().min(0),
  recurrence: taskRecurrenceSchema,
  // Native <input type="date"> value ("YYYY-MM-DD") or "" for no deadline.
  dueDate: z.string().optional(),
});
export type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>;

/** Temptation intro: optional item + a price in dollars (> 0 to proceed). */
export const temptationFormSchema = z.object({
  item: z.string().trim().max(80).optional(),
  amount: z.coerce.number().int().positive().max(100_000),
});
export type TemptationFormValues = z.infer<typeof temptationFormSchema>;
