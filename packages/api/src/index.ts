export { isAuthError } from './auth-error';
export { type CreateClientOptions, createTrpcClient, makeQueryClient } from './client';
export {
  useApiHealth,
  useChildHome,
  useCreateChild,
  useCreateTransaction,
  useDeleteChild,
  useLoginChild,
  useLoginParent,
  useMe,
  useMyChildren,
  useMyDashboard,
  usePiggyBanks,
  useQuests,
  useRegisterParent,
  useRequestPasswordReset,
  useResendVerification,
  useResetKidPassword,
  useResetPassword,
  useSavingsGoals,
  useSetChildActive,
  useUpdateAllowance,
  useUpdateChild,
  useVerifyEmail,
} from './hooks';
export { ApiProvider, type ApiProviderProps } from './provider';
export {
  type AppRouter,
  type RouterInputs,
  type RouterOutputs,
  useTRPC,
  useTRPCClient,
} from './trpc';
