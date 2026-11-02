# Recall frontend

React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, and Lucide provide the frontend foundation for Recall.

## Local development

1. Copy `.env.example` to `.env` if the backend is not running at the default `http://localhost:8000/api` address.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

The client includes login and registration routes. It expects the backend to set an HTTP-only refresh cookie, so its API URL must match the backend's CORS configuration.

## Checks

```bash
npm run lint
npm run build
```
