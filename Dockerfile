FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# proto for gRPC
COPY hobom-buf-proto ./hobom-buf-proto

EXPOSE 8080

CMD ["node", "dist/main.js"]
