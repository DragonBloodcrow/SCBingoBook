#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy --schema=/app/prisma/schema.prisma

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Seeding catalog items..."
  node /app/prisma/seed.js
fi

echo "Starting API..."
exec "$@"
