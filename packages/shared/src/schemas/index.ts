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

/** Confirm ownership of an email via the token from the verification link. */
export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/** Start a password reset. We never reveal whether the email exists. */
export const requestPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

/** Complete a password reset with the token from the email + a new password. */
export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

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

/**
 * A parent edits a kid's profile. `childId` is validated against ownership on the
 * server. `age: null` clears the age; omitting a field leaves it unchanged.
 */
export const updateChildSchema = z.object({
  childId: z.string().min(1),
  displayName: z.string().trim().min(1).max(60).optional(),
  age: z.number().int().min(1).max(25).nullable().optional(),
});
export type UpdateChildInput = z.infer<typeof updateChildSchema>;

/** A parent sets a kid's weekly allowance amount + whether it auto-deposits. */
export const updateAllowanceSchema = z.object({
  childId: z.string().min(1),
  // Cap at $100k to reject fat-finger / overflow input; cents are non-negative.
  allowanceCents: z.number().int().min(0).max(100_000_00),
  autopayEnabled: z.boolean(),
});
export type UpdateAllowanceInput = z.infer<typeof updateAllowanceSchema>;

/** A parent sets a new password for their kid (kids forget passwords). */
export const resetChildPasswordSchema = z.object({
  childId: z.string().min(1),
  password: passwordSchema,
});
export type ResetChildPasswordInput = z.infer<typeof resetChildPasswordSchema>;

/** A parent deactivates (active=false, blocks login) or reactivates a kid. */
export const setChildActiveSchema = z.object({
  childId: z.string().min(1),
  active: z.boolean(),
});
export type SetChildActiveInput = z.infer<typeof setChildActiveSchema>;

/** A parent permanently deletes a kid (cascades piggy banks, goals, quests, tasks). */
export const deleteChildSchema = z.object({
  childId: z.string().min(1),
});
export type DeleteChildInput = z.infer<typeof deleteChildSchema>;

// ---- Tasks (parent-assigned chores/lessons with an approval loop) ----

export const taskCategorySchema = z.enum(['chore', 'lesson']);
export const taskPayTypeSchema = z.enum(['money', 'xp', 'both']);
export const taskRecurrenceSchema = z.enum(['once', 'daily', 'weekly']);

/** A parent assigns a task to one of their kids. */
export const createTaskSchema = z.object({
  childId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  category: taskCategorySchema,
  payType: taskPayTypeSchema,
  // Money reward (cents, capped at $100k) and/or XP reward.
  amountCents: z.number().int().min(0).max(100_000_00),
  rewardXp: z.number().int().min(0).max(100_000),
  recurrence: taskRecurrenceSchema,
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/** Reference a single task (approve / reject / delete). */
export const taskIdSchema = z.object({ taskId: z.string().min(1) });
export type TaskIdInput = z.infer<typeof taskIdSchema>;

/** A kid marks a task done, optionally with a note for the parent. */
export const submitTaskSchema = z.object({
  taskId: z.string().min(1),
  note: z.string().max(280).optional(),
});
export type SubmitTaskInput = z.infer<typeof submitTaskSchema>;
