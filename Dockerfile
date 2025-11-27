# Andrino Academy - Production Dockerfile for Coolify/VPS
# Optimized for Next.js 15.5.0 with Prisma SQLite

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies based on the preferred package manager
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    npm install; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
RUN npm run build:original

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


# Copy all app files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/start.sh ./start.sh

# Explicitly copy Prisma engine binaries
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Verify seed file exists (for debugging)
RUN ls -la /app/prisma/seed*.ts || echo "Seed files not found"

# Create necessary directories with proper permissions
RUN mkdir -p /app/public/uploads/assignments \
    && mkdir -p /app/public/uploads/courses \
    && mkdir -p /app/public/uploads/modules \
    && mkdir -p /app/assets \
    && mkdir -p /app/.next/cache/images \
    && mkdir -p /app/prisma \
    && mkdir -p /app/src/generated \
    && chmod +x /app/start.sh \
    && chown -R nextjs:nodejs /app/public \
    && chown -R nextjs:nodejs /app/assets \
    && chown -R nextjs:nodejs /app/.next/cache \
    && chown -R nextjs:nodejs /app/prisma \
    && chown -R nextjs:nodejs /app/src

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application with database initialization
CMD ["sh", "/app/start.sh"]
