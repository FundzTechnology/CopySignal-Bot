# syntax = docker/dockerfile:1
# Build stage — compile TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript → JavaScript
RUN npx tsc

# ─────────────────────────────────────────────
# Production stage — lean image
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JS from build stage
COPY --from=builder /app/dist ./dist

# Health check — Fly.io uses this to verify the machine is alive
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3001

CMD ["node", "dist/index.js"]
