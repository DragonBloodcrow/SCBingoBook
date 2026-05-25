# Build context: repository root (see docker-compose.yml)
FROM node:22-alpine AS builder

WORKDIR /app

COPY frontend/package.json ./frontend/

WORKDIR /app/frontend
RUN npm install

COPY frontend/ ./

# Relative URL — nginx proxies /api to the backend on the same host
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# --- Production image ---
FROM nginx:alpine AS runner

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
