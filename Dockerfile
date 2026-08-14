FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY . .

CMD ["npx", "fastify", "start", "-a", "0.0.0.0", "app.js"]