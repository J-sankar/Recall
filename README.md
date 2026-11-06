# Recall

Recall is a lightweight personal knowledge hub for saving and retrieving links, notes, and code snippets.

## Repository layout

- `recall-frontend/` — React client
- `recall-backend/` — FastAPI service
- `extension/` — TypeScript browser-extension scaffold for capture experiments
- `link-preview/` — Cloudflare Worker used to fetch link metadata
- `RECALL_PROJECT_CONTEXT.md` — product and architecture decisions for contributors and AI agents
- `docs/DATABASE.md` — current relational schema and migration workflow

## Getting started

Start the backend from `recall-backend/`:

```bash
cp .env.example .env
uv sync --all-groups
uv run uvicorn recall_backend.main:app --reload
```

The backend requires `DATABASE_URL`, `JWT_SECRET_KEY`, `WORKER_URL`, and
`RECALL_WORKER_SECRET`. For local HTTP development, keep `COOKIE_SECURE=false`.
The worker URL is used by link-preview capture; the API still saves a link
when preview fetching fails.

Then start the frontend from `recall-frontend/`:

```bash
cp .env.example .env
npm install
npm run dev
```

The frontend expects the API at `http://localhost:8000/api` by default. Do not commit `.env` files; use the supplied examples as templates.

To build the browser-extension scaffold:

```bash
cd extension
npm install
npm run build
```

The extension currently reads the active tab and sends a capture message to
its background worker. It does not yet authenticate with the API or save a
resource remotely.

## Current status

The current working slice includes:

- PostgreSQL/SQLAlchemy models and Alembic migrations for users, resources,
  collections, tags, resource tags, and refresh tokens.
- JWT access tokens, rotating HTTP-only refresh tokens, registration, login,
  refresh, logout, and current-user endpoints.
- Authenticated resource create, list, detail, update, and delete endpoints
  for links, notes, and snippets, including Inbox filtering and ownership
  checks.
- A React frontend with authentication, protected routes, Inbox, all-resources
  views, quick capture, detail/edit/delete flows, responsive theming, and
  link-preview autofill.
- A link-preview worker integration and an initial browser-extension scaffold.

Collections, tags, global search, favorites/archive UI, dashboard workflows,
and production deployment are not complete yet. The next implementation
slice is collections and tags, followed by search.

## Checks

Backend:

```bash
cd recall-backend
uv run ruff check .
uv run pytest
```

Frontend:

```bash
cd recall-frontend
npm run lint
npm run build
```
