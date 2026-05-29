# SCBingoBook

Star Citizen collection and bingo tracking — Docker Compose deployment for an **Ubuntu VPS**.

## Quick deploy

```bash
git clone https://github.com/DragonBloodcrow/SCBingoBook.git
cd SCBingoBook

cp .env.example .env
nano .env    # set passwords, JWT secret, and your server URL

docker compose up -d --build
```

Open the URL you set as `PUBLIC_URL` / `CORS_ORIGIN` (default port **80**).

Check status:

```bash
docker compose ps
docker compose logs -f
```

---

## Ubuntu VPS setup (first time)

### 1. Install Docker

```bash
sudo bash scripts/install-docker-ubuntu.sh
sudo usermod -aG docker $USER
```

Log out and back in so your user can run Docker without `sudo`.

### 2. Clone and configure

```bash
git clone https://github.com/YOUR_USER/SCBingoBook.git
cd SCBingoBook
cp .env.example .env
```

Edit `.env` on the server:

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `POSTGRES_PASSWORD` | Yes | Strong database password |
| `JWT_SECRET` | Yes | `openssl rand -base64 48` |
| `CORS_ORIGIN` | Yes | Public app URL, e.g. `http://203.0.113.10` |
| `PUBLIC_URL` | Yes* | Same as `CORS_ORIGIN` (documentation / scripts) |
| `POSTGRES_USER` | Yes | Default `scbingobook` is fine |
| `POSTGRES_DB` | Yes | Default `scbingobook` is fine |
| `HTTP_PORT` | No | Host port (default `80`) |
| `RUN_SEED` | No | `true` on first deploy, then `false` |

\* `PUBLIC_URL` is used by helper scripts; the API uses `CORS_ORIGIN`.

### 3. Start the stack

```bash
docker compose up -d --build
```

Alternative helper (creates `.env` on first run, validates placeholders):

```bash
chmod +x scripts/*.sh
./scripts/deploy.sh
```

### 4. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp    # or your HTTP_PORT
sudo ufw enable
```

### 5. Updates

```bash
git pull
docker compose up -d --build
# or: ./scripts/update.sh
```

---

## Architecture

```
Internet → host:HTTP_PORT → frontend (nginx)
                                ├── /      → React SPA
                                ├── /api/* → backend:3001 (Docker DNS: backend)
                                └── /health → backend:3001

postgres:5432 (Docker DNS: postgres) — persistent volume, not exposed on host
```

| Service | Restart | Health check | Host exposure |
| ------- | ------- | ------------ | ------------- |
| postgres | `unless-stopped` | `pg_isready` | None (internal network) |
| backend | `unless-stopped` | `GET /health` | None (`expose` only) |
| frontend | `unless-stopped` | `GET /health` (via proxy) | `HTTP_PORT` → 80 |

Data is stored in the named volume `postgres_data`.

---

## Deployment requirements checklist

| Requirement | Status |
| ----------- | ------ |
| Linux compatible (Alpine images, LF shell scripts) | Yes |
| GitHub ready (`.env.example`, no secrets in repo) | Yes |
| Production-safe defaults (no dev JWT/CORS fallbacks) | Yes |
| Configuration via `.env` | Yes (`env_file` + variable substitution) |
| Proper `.gitignore` (`.env`, `node_modules`, etc.) | Yes |
| Persistent PostgreSQL volume | Yes (`postgres_data`) |
| Restart policies | Yes (`unless-stopped` on all services) |
| Health checks | Yes (all services; startup ordering via `depends_on`) |
| No localhost-only assumptions | Yes (relative `/api`, Docker service names, `0.0.0.0` bind) |
| Container networking (frontend → backend → postgres) | Yes |
| Deploy with `docker compose up -d --build` | Yes |

---

## Operations

```bash
docker compose ps
docker compose logs -f
docker compose logs -f backend
docker compose restart backend
docker compose down              # stop; keeps database volume
docker compose down -v           # stop and DELETE database (destructive)
```

---

## HTTPS (optional)

Terminate TLS with Caddy or nginx on the host, or use a reverse proxy, then set:

```env
CORS_ORIGIN=https://bingo.yourdomain.com
PUBLIC_URL=https://bingo.yourdomain.com
```

---

## REST API

All routes are available under `/api` on your public URL (proxied by nginx).

| Method | Endpoint | Auth |
| ------ | -------- | ---- |
| GET | `/api` | — |
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| GET | `/api/auth/me` | JWT |
| GET | `/api/items` | — |
| GET | `/api/items/:id` | — |
| GET | `/api/collection` | JWT |
| GET | `/api/collection/stats` | JWT |
| PUT | `/api/collection/:itemId` | JWT |

```
Authorization: Bearer <token>
```

---

## Project layout

```
SCBingoBook/
├── docker-compose.yml   # production stack
├── .env.example         # copy to .env on the server
├── frontend/            # React + nginx
├── backend/             # Express API
├── prisma/              # schema + migrations
└── scripts/             # optional Ubuntu helpers
```

Migrations run automatically when the backend container starts.
