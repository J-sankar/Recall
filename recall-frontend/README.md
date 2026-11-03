# Recall frontend

React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, and Lucide provide the frontend foundation for Recall.

## Local development

1. Copy `.env.example` to `.env` if the backend is not running at the default `http://localhost:8000/api` address.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

The client includes login and registration routes. It expects the backend to set an HTTP-only refresh cookie, so its API URL must match the backend's CORS configuration.

## Interface

The sidebar links to Home, Inbox, All resources, and quick capture. On smaller screens, the navigation opens in a modal drawer. Home displays a landing page for visitors and recent captures for signed-in users.

Use the sidebar's Light mode / Dark mode button to change appearance. Recall follows the system theme until a preference is saved locally. Both themes share semantic color tokens in `src/index.css`: graphite and silver with amber actions in dark mode, porcelain and ink with bronze accents in light mode. Inter and Space Grotesk are bundled locally through Fontsource. The logo, favicon, and landing illustration are SVGs, and interface icons come from Lucide.

Inbox and All resources support grid and compact list views, remembered locally. Links, notes, and snippets have distinct detail views; snippets include line numbers and a copy action that copies only the original content. Resource lists and recent resources use the existing authenticated API. Motion is CSS-only and respects `prefers-reduced-motion`.

## Checks

```bash
npm run lint
npm run build
```
