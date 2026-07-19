# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24.16.0

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-only values satisfy server configuration validation. Runtime secrets are
# supplied by Compose or the deployment platform and are never baked in here.
ENV NODE_ENV=production \
    DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
    DIRECT_URL=postgresql://build:build@127.0.0.1:5432/build \
    SUPABASE_URL=http://127.0.0.1:54321 \
    SUPABASE_ANON_KEY=build-placeholder \
    SUPABASE_SERVICE_ROLE_KEY=build-placeholder \
    SUPABASE_STORAGE_BUCKET=resumes \
    MAX_UPLOAD_SIZE_MB=10 \
    APP_NAME=Resume-Intelligence \
    APP_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info \
    AI_DEFAULT_PROVIDER=gemini \
    AI_TIMEOUT_MS=30000 \
    AI_RETRY_COUNT=2
RUN npx prisma generate && npm run build

FROM base AS runtime-common
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      dumb-init \
    && rm -rf /var/lib/apt/lists/*
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs --create-home nextjs
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

FROM runtime-common AS latex-runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
      texlive-latex-base \
      texlive-latex-recommended \
      texlive-latex-extra \
      texlive-fonts-recommended \
    && rm -rf /var/lib/apt/lists/*

FROM latex-runtime AS runner
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

FROM runtime-common AS worker
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/package-lock.json /app/prisma.config.ts /app/tsconfig.json ./
USER nextjs
ENTRYPOINT ["dumb-init", "--"]
CMD ["./node_modules/.bin/tsx", "src/workers/workers.ts"]
