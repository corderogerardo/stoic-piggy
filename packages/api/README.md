# @stoicpiggy/api

The shared, end-to-end-typed API client for landing, dashboard, and mobile. Built on
**tRPC v11** + **TanStack Query v5** (`@trpc/tanstack-react-query`). The `AppRouter`
type comes straight from `@stoicpiggy/backend` — change a procedure on the server and
every client updates at the type level, no codegen.

## 1. Wrap your app once

```tsx
import { ApiProvider } from '@stoicpiggy/api';

// web (Next client component) or mobile (Expo root layout)
<ApiProvider url="http://localhost:3001/trpc" getToken={getAuthToken}>
  {children}
</ApiProvider>
```

- **Landing / Dashboard (Next):** add `<ApiProvider>` inside a `'use client'` providers
  component and use it in `app/layout.tsx`. Add `@stoicpiggy/api` to `transpilePackages`.
- **Mobile (Expo):** wrap the root in `app/_layout.tsx`. Point `url` at your machine's LAN
  IP (e.g. `http://192.168.1.20:3001/trpc`) so a device can reach it.

## 2. Query & mutate (same API everywhere)

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '@stoicpiggy/api';

function PiggyBanks({ childId }: { childId: string }) {
  const trpc = useTRPC();

  const banks = useQuery(trpc.piggy.listByChild.queryOptions({ childId }));
  const addTx = useMutation(trpc.piggy.createTransaction.mutationOptions());

  // banks.data is fully typed as PiggyBank[]
  return /* ... */;
}
```

## 3. Inferred types

```ts
import type { RouterInputs, RouterOutputs } from '@stoicpiggy/api';

type NewTx = RouterInputs['piggy']['createTransaction']; // CreateTransactionInput
type Banks = RouterOutputs['piggy']['listByChild'];       // PiggyBank[]
```

> Requires `pnpm db:generate` to have run once (the backend's Prisma client) before a
> full typecheck, since the server router is built from real services.
