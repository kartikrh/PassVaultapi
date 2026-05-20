# syntax=docker/dockerfile:1.6

############################
# Stage 1 — build deps
############################
FROM node:20-bookworm-slim AS builder

ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn \
    PYTHONUNBUFFERED=1

# Native build deps for `canvas`, `sharp`, `bcrypt`, `pg`, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    libvips-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Install full deps (incl. native compiles); omit dev for prod image
RUN npm ci --omit=dev

############################
# Stage 2 — runtime
############################
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Runtime shared libs only (no -dev packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    libpixman-1-0 \
    libvips42 \
    ca-certificates \
    tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy installed modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY . .

# Drop privileges
RUN chown -R node:node /app
USER node

EXPOSE 3000

# tini = proper PID 1, forwards signals so Railway can stop cleanly
ENTRYPOINT ["/usr/bin/tini", "--"]

# Bind to 0.0.0.0 and honor Railway's $PORT
CMD ["sh", "-c", "npx fastify start -a 0.0.0.0 -p ${PORT:-3000} app.js"]
