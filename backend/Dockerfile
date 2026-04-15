# ─── Stage 1: Builder ─────────────────────────────────────────
FROM node:18 AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client
RUN npx prisma generate

# ─── Stage 2: Runner ──────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 3000

# Default start command (overridden by docker-compose to run migrations first)
CMD ["node", "src/server.js"]
