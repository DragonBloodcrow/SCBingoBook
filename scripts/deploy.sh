#!/usr/bin/env bash
# SCBingoBook — one-command deploy on Ubuntu (Docker required)
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Run: scripts/install-docker-ubuntu.sh"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is not available."
  exit 1
fi

if [ ! -f .env ]; then
  echo "Creating .env from .env.example — edit secrets before production use!"
  cp .env.example .env
  echo ""
  echo "IMPORTANT: Edit .env and set POSTGRES_PASSWORD, JWT_SECRET, PUBLIC_URL, CORS_ORIGIN"
  echo "Then run this script again."
  exit 1
fi

# Warn if placeholder secrets remain
if grep -q 'REQUIRED_' .env 2>/dev/null; then
  echo "ERROR: .env still contains REQUIRED_ placeholders. Edit .env first."
  exit 1
fi

echo "Building and starting SCBingoBook..."
docker compose pull postgres 2>/dev/null || true
docker compose up -d --build

echo ""
echo "Deployment started. Check status:"
echo "  docker compose ps"
echo "  docker compose logs -f"
echo ""
echo "Open in browser: $(grep '^PUBLIC_URL=' .env | cut -d= -f2- || echo 'http://YOUR_SERVER')"
