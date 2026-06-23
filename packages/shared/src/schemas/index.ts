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
