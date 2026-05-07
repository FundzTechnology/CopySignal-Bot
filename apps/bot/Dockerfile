# syntax = docker/dockerfile:1
# Single-stage build — tsx handles TypeScript natively, no tsc needed
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

# Health check — Fly.io uses this to verify the machine is alive
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
