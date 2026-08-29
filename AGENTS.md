# ReviewHub — Base44 Dev Environment

## Stack
React 19 + Vite 6 + Express, single combined dev server in `server.ts`.
`server.ts` runs Express with Vite in **middleware mode** (`appType: 'spa'`) and serves an
in-memory REST API under `/api/*`. The frontend is served as live Vite-transformed source
(not a prebuilt bundle) in development. Listens on `0.0.0.0:3000`.

## Running
```
docker compose -f docker-compose.base44.yml up -d
```
- Base image `node:22-slim`; deps installed at container start via `npm install` into a
  named volume (`node_modules`) so they persist across restarts.
- Dev command: `npx tsx server.ts` (Express + Vite middleware). Frontend HMR is active.
- Health check: `GET /api/health` → `{ "status": "ok", ... }`.

## External credentials
- **None required to boot.** Firebase (`VITE_FIREBASE_*`) and Gemini (`GEMINI_API_KEY`)
  are referenced in `.env.example` but are **optional**:
  - Firebase: `src/services/firebase.ts` → `isFirebaseConfigured()` returns false when the
    `VITE_FIREBASE_*` vars are absent, so the client falls back to the in-memory `/api`
    endpoints and a local in-browser store (`src/services/api.ts`).
  - Gemini: declared as a capability in `metadata.json` but not currently imported/used
    in `server.ts` or `src/`.
- If you later want Firestore persistence or AI features, add the relevant keys via the
  Base44 secrets flow (they land in `/run/base44/app.env`).

## Preview / external host
The preview reaches port 3000 through a proxy hostname that changes per environment.
`vite.config.ts` sets `server.host: true` and `server.allowedHosts: true` so Vite's
middleware accepts the external Host header (without this, the root HTML returns a 403
"Blocked request" while `/api/*` still works).

## Verify it works
```
curl -sf -H "Host: external-preview.example.com" http://localhost:3000/            # HTML (200)
curl -sf -H "Host: external-preview.example.com" http://localhost:3000/api/health  # JSON
curl -sf -H "Host: external-preview.example.com" http://localhost:3000/api/products # JSON product list
```

## Notes
- `bun.lock` exists but the project runs on Node via `tsx`; npm is used in the container.
- The client (`src/services/api.ts`) has graceful local fallbacks for every endpoint, so
  the UI renders even if the Express API is unreachable.
