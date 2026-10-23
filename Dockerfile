FROM node:20-bookworm-slim

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .

# Don't run as root; images/ is written to at runtime.
RUN mkdir -p images && chown node:node images
USER node

CMD ["npx", "fastify", "start", "--options", "-a", "0.0.0.0", "app.js"]