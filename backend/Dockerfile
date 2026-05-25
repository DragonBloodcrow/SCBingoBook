# Build context: repository root (see docker-compose.yml)
FROM node:22-alpine AS builder

WORKDIR /app

COPY prisma ./prisma
COPY backend/package.json ./backend/

WORKDIR /app/backend
RUN npm install
COPY backend/ ./

RUN npx prisma generate --schema=../prisma/schema.prisma

# --- Production image ---
FROM node:22-alpine AS runner

RUN apk add --no-cache curl

WORKDIR /app/backend

ENV NODE_ENV=production

COPY prisma /app/prisma
COPY backend/package.json ./
COPY backend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/src ./src

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://127.0.0.1:3001/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
