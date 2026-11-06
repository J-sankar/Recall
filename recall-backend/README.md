# Recall backend

FastAPI service for Recall. The current implementation includes PostgreSQL/
SQLAlchemy models, Alembic migrations, authentication, user ownership, and
resource CRUD for links, notes, and snippets.

## Local development

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET_KEY`,
   `WORKER_URL`, and `RECALL_WORKER_SECRET`.
2. Install dependencies with `uv sync --all-groups`.
3. Apply migrations with `uv run alembic upgrade head`.
4. Run the API with `uv run uvicorn recall_backend.main:app --reload`.

The health check is available at `GET /api/health`. Authentication endpoints
are under `/api/auth`; resource endpoints are under `/api/resources`.

## Authentication configuration

Set `JWT_SECRET_KEY` to a long random value before using authentication. The
API exposes registration, login, refresh, logout, and current-user endpoints
under `/api/auth`. Refresh tokens are rotated and stored as hashes. In local
HTTP development, set `COOKIE_SECURE=false`; production deployments must use
HTTPS and `COOKIE_SECURE=true`.

## Resource API

Authenticated users can create, list, inspect, update, and delete `link`,
`note`, and `snippet` resources. A resource with no collection is in the
Inbox. List requests support `collection_id`, `inbox`, `skip`, and `limit`;
collection and tag management is not implemented yet.

`POST /api/link-previews` forwards a URL to the configured Cloudflare Worker
and returns metadata when available. Preview failures fall back to the URL so
resource capture can continue.

## Checks

```bash
uv run ruff check .
uv run pytest
```

The test suite uses an in-memory SQLite database and covers authentication,
refresh-token rotation, current-user authorization, schema registration, and
basic resource creation.
