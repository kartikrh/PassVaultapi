FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY . .

ARG PORT

EXPOSE ${PORT}

CMD ["npx", "fastify", "start", "app.js"]