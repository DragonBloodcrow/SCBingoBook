#!/bin/sh
set -e

# Build DATABASE_URL with URL-encoded credentials (fixes special chars like ! ? @ in passwords)
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL=$(node -e "
    const u = process.env.POSTGRES_USER || '';
    const p = process.env.POSTGRES_PASSWORD || '';
    const d = process.env.POSTGRES_DB || 'postgres';
    if (!u || !p) {
      console.error('POSTGRES_USER and POSTGRES_PASSWORD are required when DATABASE_URL is not set');
      process.exit(1);
    }
    const url = 'postgresql://'
      + encodeURIComponent(u) + ':' + encodeURIComponent(p)
      + '@postgres:5432/' + encodeURIComponent(d) + '?schema=public';
    process.stdout.write(url);
  ")
fi

echo "Running database migrations..."
npx prisma migrate deploy --schema=/app/prisma/schema.prisma

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Seeding catalog items..."
  cd /app/backend && node /app/prisma/seed.js
fi

echo "Starting API..."
exec "$@"
