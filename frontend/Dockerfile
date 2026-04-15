# ─── Stage 1: Builder ─────────────────────────────────────────
FROM node:18 AS builder

WORKDIR /app

# Declare build arg (VITE_ vars must be present at build time)
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Install static file server
RUN npm install -g serve

# Copy built assets
COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
