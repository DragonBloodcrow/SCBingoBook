#!/usr/bin/env bash
# Pull latest from GitHub and rebuild containers
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

git pull

docker compose up -d --build

echo "Update complete."
docker compose ps
