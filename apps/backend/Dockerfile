# Build from the repo root:  docker build -f apps/backend/Dockerfile -t stoicpiggy-backend .
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl && corepack enable
WORKDIR /app

# --- Prune the monorepo down to just the backend + its workspace deps ---
FROM base AS pruner
COPY . .
RUN npx turbo@^2 prune @stoicpiggy/backend --docker

# --- Install deps and build ---
FROM base AS builder
COPY --from=pruner /app/.npmrc ./.npmrc
COPY --from=pruner /app/out/json/ .
# Uses pnpm-lock.yaml if committed (reproducible); generates one if absent.
RUN pnpm install
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter @stoicpiggy/backend db:generate \
  && pnpm --filter @stoicpiggy/backend build

# --- Runtime ---
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app .
WORKDIR /app/apps/backend
EXPOSE 3001
CMD ["node", "dist/main.js"]
