# Auth & backend deployment

How parent/kid authentication works, and how CI ships the backend + Postgres.

## Auth model

- **Parents** sign up / sign in on the dashboard with **email + password**.
- A parent creates **kid accounts** in the dashboard (Kids tab → *Create kid account*):
  display name + a **globally-unique username** + a password.
- **Kids** sign in on the mobile app with that **username + password**.
- Auth is a signed **JWT bearer token** (`Authorization: Bearer <token>`), verified
  in the tRPC context. Tokens carry `{ sub, role: 'parent' | 'child', parentId? }`.
  - Dashboard stores the token in `localStorage`.
  - Mobile stores it in the device keychain via `expo-secure-store`.
- Passwords are hashed with **bcrypt** (`bcryptjs`). Hashes are never returned to clients.

### Procedure access

| Procedure                     | Who                          |
| ----------------------------- | ---------------------------- |
| `auth.registerParent/login*`  | public                       |
| `auth.me`                     | any signed-in user           |
| `children.dashboard/list/create` | parent only               |
| `me.home`                     | child only                   |
| `piggy/goals/quests.*`        | signed-in; parent must own the child, kid only their own |

### Seeded demo logins (after `pnpm --filter @stoicpiggy/backend db:seed`)

- Parent: `patricia@stoicpiggy.dev` / `piggy1234`
- Kid: `marco` / `piggy1234` (others: `sofia`, `lucas`, `emma`, `mateo`, `valeria`)

## Environment variables

Backend (`apps/backend/.env`):

- `DATABASE_URL` — pooled Postgres connection (runtime).
- `DIRECT_URL` — direct (non-pooled) Postgres connection (migrations). On Neon this
  is the endpoint host **without** the `-pooler` suffix.
- `JWT_SECRET` — **required in production** (the API refuses to boot without it).
  Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

## CI/CD (GitHub Actions)

- **`ci.yml`** — lint, typecheck, unit tests, build **+** a `backend-integration` job
  that runs the auth flow against a real Postgres service container.
- **`deploy.yml`** (runs after CI passes on `main`, or via *Run workflow*):
  1. `backend-migrate` → `prisma migrate deploy` against production (idempotent).
  2. `backend-deploy` → triggers the Render deploy hook (only after migrations).
  3. `landing` / `dashboard` → Cloudflare Pages.

Render `autoDeploy` is **off** so deploys are gated on CI + migrations.

### Required repository secrets

| Secret                   | Used by            | What                                                       |
| ------------------------ | ------------------ | --------------------------------------------------------- |
| `PROD_DIRECT_URL`        | `backend-migrate`  | Postgres connection string for migrations. We use **Neon** — prefer the **direct (non-pooled)** endpoint (host without `-pooler`) so `migrate deploy` can take advisory locks. |
| `RENDER_DEPLOY_HOOK_URL` | `backend-deploy`   | Render → Service → Settings → **Deploy Hook** URL.        |
| `CLOUDFLARE_API_TOKEN_STOIC_PIGGY` | pages      | (existing) Cloudflare Pages deploy token.                 |

Also set `JWT_SECRET` in the Render dashboard for the API service.

## One-time production migration baseline

> **Status:** ✅ Done — the `0_init` baseline was applied to the Neon prod DB on
> 2026-06-24, so `_prisma_migrations` now records `0_init`. `add_auth` is still
> pending and will be applied automatically by `deploy.yml`'s `backend-migrate`
> job on the next deploy (or run `pnpm exec prisma migrate deploy` manually).

The production DB predates Prisma Migrate (it was created with `db push`), so the
tables for the `0_init` migration already exist. Mark that baseline as applied
**once** so `migrate deploy` only runs the newer `add_auth` migration:

```bash
cd apps/backend
DATABASE_URL="$PROD_DIRECT_URL" DIRECT_URL="$PROD_DIRECT_URL" \
  pnpm exec prisma migrate resolve --applied 0_init
```

After that, every `deploy.yml` run applies pending migrations automatically. A
brand-new/empty database needs no baseline — `migrate deploy` creates everything.
