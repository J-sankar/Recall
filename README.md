# Recall

Recall is a lightweight personal knowledge hub for saving and retrieving links, notes, and code snippets.

## Repository layout

- `recall-frontend/` — React client
- `recall-backend/` — FastAPI service
- `RECALL_PROJECT_CONTEXT.md` — product and architecture decisions for contributors and AI agents
- `docs/DATABASE.md` — current relational schema and migration workflow

## Getting started

Start the backend from `recall-backend/`:

```bash
cp .env.example .env
uv sync --all-groups
uv run uvicorn recall_backend.main:app --reload
```

Then start the frontend from `recall-frontend/`:

```bash
cp .env.example .env
npm install
npm run dev
```

The frontend expects the API at `http://localhost:8000/api` by default. Do not commit `.env` files; use the supplied examples as templates.

## Current status

Milestone 2 is complete: the project includes JWT access tokens, rotating HTTP-only refresh tokens, authentication endpoints, frontend session handling, and a reusable current-user ownership dependency. The next milestone is resource CRUD.
