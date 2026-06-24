export { isAuthError } from './auth-error';
export { type CreateClientOptions, createTrpcClient, makeQueryClient } from './client';
export {
  useApiHealth,
  useChildHome,
  useCreateChild,
  useCreateTransaction,
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
  useResetPassword,
  useSavingsGoals,
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
