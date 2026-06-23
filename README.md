# 🐷 Stoic Piggy

A TypeScript monorepo for Stoic Piggy — teaching kids healthy, gamified money habits.

| App | Path | Stack | Port |
| --- | --- | --- | --- |
| Landing | `apps/landing` | Next.js 16 (App Router) + Tailwind v4 | 3000 |
| Backend API | `apps/backend` | NestJS 11 + Prisma 7 (Supabase Postgres) | 3001 |
| Parents dashboard | `apps/parents` | Next.js 16 (App Router) + Tailwind v4 | 3002 |
| Mobile | `apps/stoicpiggy` | Expo SDK 56 · expo-router · Expo UI · Reanimated · ExecuTorch | — |
| Shared client code | `packages/shared` | TypeScript + zod (`@stoicpiggy/shared`) | — |
| TS presets | `packages/typescript-config` | Shared `tsconfig` bases | — |

Tooling: **pnpm** workspaces · **Turborepo** · **Biome** (lint + format) · **Vitest / Jest / jest-expo** (unit) · **Playwright / Maestro** (e2e) · **GitHub Actions** CI · **Husky** + lint-staged.

## Prerequisites

- Node `>= 22` (`.nvmrc` pins 22) and pnpm `>= 10` (`corepack enable`)
- Mobile: Xcode / Android Studio and a dev build (Reanimated + ExecuTorch need the New Architecture, so Expo Go won't run them). Maestro for e2e.
- Optional: Docker Desktop, to run the whole stack locally (see below).

## Quick start

```bash
pnpm install                          # install everything (also writes pnpm-lock.yaml)

cp apps/backend/.env.example apps/backend/.env   # add your Supabase connection strings
pnpm db:generate                      # generate the Prisma client

pnpm dev                              # run all apps via Turbo
# or a single app:
pnpm --filter @stoicpiggy/landing dev
pnpm --filter @stoicpiggy/parents dev
pnpm --filter @stoicpiggy/backend dev
pnpm --filter @stoicpiggy/mobile dev
```

## Workspace layout

```
stoic-piggy/
├── apps/
│   ├── landing/      Next.js marketing site
│   ├── parents/      Next.js parents dashboard / backoffice
│   ├── backend/      NestJS API + Prisma (Supabase)
│   └── stoicpiggy/   Expo mobile app
├── packages/
│   ├── shared/             @stoicpiggy/shared — types, zod schemas, API client, utils
│   └── typescript-config/  shared tsconfig presets
├── docker-compose.yml
├── turbo.json
├── biome.json
└── pnpm-workspace.yaml
```

## Scripts (run from the root)

| Command | What it does |
| --- | --- |
| `pnpm dev` | Run every app in dev mode (Turbo) |
| `pnpm build` | Build all apps & packages |
| `pnpm lint` / `pnpm lint:fix` | Biome check (and autofix) |
| `pnpm format` | Biome format |
| `pnpm typecheck` | `tsc --noEmit` across the workspace |
| `pnpm test` | Unit tests (Vitest / Jest / jest-expo) |
| `pnpm test:e2e` | Playwright (web) |
| `pnpm db:generate` | Prisma client generation |

## Running tests

The test stack: **Vitest** (`packages/shared` + web apps), **Jest + Supertest**
(backend), **jest-expo** + React Native Testing Library (mobile), **Playwright**
(web e2e), **Maestro** (mobile e2e). CI (`.github/workflows/ci.yml`) runs
lint → typecheck → test → build; Husky runs `lint-staged` (Biome) pre-commit.

```bash
# one-time setup
pnpm install
pnpm db:generate                 # Prisma client (needed for the backend)

# everything
pnpm test                        # all unit tests (Turbo builds shared first)
pnpm typecheck
pnpm lint

# a single package
pnpm --filter @stoicpiggy/shared   test
pnpm --filter @stoicpiggy/backend  test
pnpm --filter @stoicpiggy/backend  test:e2e     # Supertest e2e (hits /api/health)
pnpm --filter @stoicpiggy/landing  test
pnpm --filter @stoicpiggy/parents  test
pnpm --filter @stoicpiggy/mobile   test         # jest-expo

# web end-to-end (installs browsers once)
pnpm --filter @stoicpiggy/landing exec playwright install
pnpm --filter @stoicpiggy/landing  test:e2e

# mobile end-to-end (needs a simulator/emulator + Maestro)
pnpm --filter @stoicpiggy/mobile   test:e2e
```

## Run locally with Docker

Bring up Postgres + the backend + both web apps with one command:

```bash
docker compose up --build
```

| Service | URL |
| --- | --- |
| Landing | http://localhost:3000 |
| Parents dashboard | http://localhost:3002 |
| Backend health | http://localhost:3001/api/health |
| Postgres | `localhost:5432` — user `postgres`, pass `postgres`, db `stoicpiggy` |

- The backend runs `prisma db push` on boot to create tables from `schema.prisma`
  in the local Postgres — **no Supabase needed for local dev**.
- The **mobile app isn't containerized** — run it on a device/simulator with
  `pnpm --filter @stoicpiggy/mobile dev`.
- `NEXT_PUBLIC_*` values are baked at build time; to point the web apps at a
  different API, pass it as a Docker build arg and rebuild.
- For reproducible builds, run `pnpm install` once and commit `pnpm-lock.yaml` (the images use a plain `pnpm install`, so it works with or without one).
- Tear down (and wipe the database volume): `docker compose down -v`.

## Backend & Supabase

`apps/backend` connects to Supabase Postgres through Prisma. Set `DATABASE_URL`
(pooled, port 6543) and `DIRECT_URL` (direct, port 5432) in `apps/backend/.env`
— see `.env.example`. Then:

```bash
pnpm --filter @stoicpiggy/backend db:migrate   # create/apply a migration
pnpm --filter @stoicpiggy/backend db:studio    # browse data
```

The API serves under `/api` (e.g. `GET /api/health`). The shared `createApiClient`
in `@stoicpiggy/shared` is the typed client the web and mobile apps use.
