# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Disable telemetry for privacy
ENV NEXT_TELEMETRY_DISABLED 1

# Compile server.ts to server.js
RUN npx tsc server.ts --outDir . --noEmit false --esModuleInterop --module commonjs --target ES2022 --skipLibCheck

# Build the Next.js app
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files for standalone mode
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy custom server entry point (will be compiled to server.js)
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js

# Copy database folder structure (files will be mounted here)
RUN mkdir -p /app/db && chown nextjs:nodejs /app/db

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start Custom Server (Socket.io + Next)
CMD ["node", "server.js"]
