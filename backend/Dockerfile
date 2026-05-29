# Build context: repository root (see docker-compose.yml)
FROM node:22-alpine AS builder

WORKDIR /app

COPY prisma ./prisma
COPY backend/package.json ./backend/

WORKDIR /app/backend
RUN npm install
COPY backend/ ./

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

# Generate Prisma Client into ./node_modules (must run in final image path)
RUN npx prisma generate --schema=/app/prisma/schema.prisma

EXPOSE 3001

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
