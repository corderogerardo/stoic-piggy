import { z } from 'zod';

export const transactionTypeSchema = z.enum([
  'deposit',
  'withdrawal',
  'allowance',
  'reward',
  'goal_contribution',
]);

export const createTransactionSchema = z.object({
  piggyBankId: z.string().min(1),
  type: transactionTypeSchema,
  amountCents: z.number().int().positive(),
  note: z.string().max(280).optional(),
});
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const createSavingsGoalSchema = z.object({
  childId: z.string().min(1),
  title: z.string().min(1).max(120),
  targetCents: z.number().int().positive(),
});
export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>;

export const createChildSchema = z.object({
  parentId: z.string().min(1),
  displayName: z.string().min(1).max(60),
  avatarUrl: z.string().url().optional(),
});
export type CreateChildInput = z.infer<typeof createChildSchema>;

// ---- Auth ----

/** Login handle a parent picks for a kid: lowercase letters, digits, `_`, `.`, `-`. */
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-z0-9_.-]+$/, 'Use only lowercase letters, numbers, _ . -');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  // bcrypt silently truncates beyond 72 *bytes* (not chars), so cap on byte length.
  .refine((p) => new TextEncoder().encode(p).length <= 72, {
    message: 'Password must be at most 72 bytes',
  });

export const registerParentSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
  displayName: z.string().trim().min(1).max(60),
});
export type RegisterParentInput = z.infer<typeof registerParentSchema>;

export const loginParentSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type LoginParentInput = z.infer<typeof loginParentSchema>;

export const loginChildSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1),
});
export type LoginChildInput = z.infer<typeof loginChildSchema>;

/** A parent creating a kid's account. `parentId` is taken from the auth token, not the body. */
export const createChildAccountSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  username: usernameSchema,
  password: passwordSchema,
  age: z.number().int().min(1).max(25).optional(),
  avatarUrl: z.string().url().optional(),
});
export type CreateChildAccountInput = z.infer<typeof createChildAccountSchema>;
