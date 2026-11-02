# Recall backend

FastAPI service for Recall. The current milestone provides application configuration, CORS, and a health endpoint; database models and feature routes have not been added yet.

## Local development

1. Copy `.env.example` to `.env` and provide a local PostgreSQL URL when database work begins.
2. Install dependencies with `uv sync --all-groups`.
3. Run the API with `uv run uvicorn recall_backend.main:app --reload`.

The health check is available at `GET /api/health`.

## Authentication configuration

Set `JWT_SECRET_KEY` to a long random value before using authentication. The API exposes registration, login, refresh, logout, and current-user endpoints under `/api/auth`. In local HTTP development, set `COOKIE_SECURE=false`; production deployments must use HTTPS and `COOKIE_SECURE=true`.

## Checks

```bash
uv run ruff check .
uv run pytest
```
