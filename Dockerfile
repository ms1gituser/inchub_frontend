# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package descriptors and scripts needed for postinstall
COPY package*.json tsconfig.json ./
COPY scripts ./scripts

# Install dependencies
RUN npm ci

# Copy source code and configuration files
COPY src ./src
COPY public ./public
COPY eslint.config.mjs postcss.config.mjs next.config.ts ./

# Build the Next.js application
RUN npm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy output from standalone Next.js build stage
COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/.next/static ./.next/static
COPY --from=builder /usr/src/app/public ./public

# Expose Next.js server port
EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "server.js"]
