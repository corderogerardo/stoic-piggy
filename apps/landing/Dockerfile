# Build from the repo root:  docker build -f apps/landing/Dockerfile -t stoicpiggy-landing .
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat && corepack enable
WORKDIR /app

# --- Prune the monorepo to just this app + its workspace deps ---
FROM base AS pruner
COPY . .
RUN npx turbo@^2 prune @stoicpiggy/landing --docker

# --- Install + build (Turbo builds @stoicpiggy/shared first) ---
FROM base AS builder
COPY --from=pruner /app/.npmrc ./.npmrc
COPY --from=pruner /app/out/json/ .
# Uses pnpm-lock.yaml if committed (reproducible); generates one if absent.
RUN pnpm install
COPY --from=pruner /app/out/full/ .
RUN pnpm exec turbo run build --filter=@stoicpiggy/landing

# --- Runtime (Next.js standalone) ---
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/apps/landing/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/landing/.next/static ./apps/landing/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/landing/public ./apps/landing/public
USER nextjs
ENV PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "apps/landing/server.js"]
