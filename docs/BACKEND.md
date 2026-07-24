# GamersUnion Backend

Living document — updated whenever the backend changes.

## Overview

- **Location:** `server/` — Express + TypeScript (ESM), run with `tsx`. No build step; `npm run typecheck` for types.
- **Port:** `8787` (override with `PORT`). The frontend dev server proxies `/api/*` and `/auth/*` to it (see `web/vite.config.ts`), so the frontend only ever uses relative URLs.
- **Run:** `cd server && npm install && npm run dev` (watch mode) or `npm start`.
- **CORS:** locked to `FRONTEND_URL` (default `http://localhost:5173`).

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | no (8787) | Listen port |
| `FRONTEND_URL` | no (`http://localhost:5173`) | CORS origin + OpenID redirect target |
| `SELF_URL` | no (`http://localhost:PORT`) | OpenID `return_to`/realm; set when deploying behind a domain |
| `STEAM_API_KEY` | for library import | Free key from https://steamcommunity.com/dev/apikey. Steam *login* works without it; `GET /api/steam/library/:id` returns 501 without it. |

## Endpoints

### Health
- `GET /api/health` → `{ ok, steamApiConfigured }`

### Steam account linking (OpenID 2.0 + Web API proxy)
- `GET /auth/steam` — redirects to Steam's OpenID login. No key needed.
- `GET /auth/steam/return` — verifies the assertion server-side with `check_authentication` (forged redirects can't link arbitrary accounts), extracts the SteamID64, optionally fetches the persona name (needs `STEAM_API_KEY`), then redirects to `FRONTEND_URL/#/profile?steamid=...&persona=...` (or `?steam_error=verification_failed`).
- `GET /api/steam/library/:steamId` — proxies `IPlayerService/GetOwnedGames` (Steam blocks browser CORS). Validates 17-digit SteamID64. Returns `{ games: [{ appid, name, hours }] }`; 501 `steam_api_key_missing` without a key; 502 on Steam API failures; a `note` when the profile looks private.

### Support-us ads
House ads today; designed so a real ad network (AdSense/Unity/etc.) only replaces the `AD_POOL` source — the event/stats contract and frontend stay unchanged.
- `GET /api/ads/next` → `{ ad: { id, sponsor, title, body, durationSec }, stats }` (round-robin rotation).
- `POST /api/ads/:adId/event` body `{ "type": "impression" | "complete" }` → `{ ok, stats }`. 404 unknown ad, 400 bad type.
- `GET /api/ads/stats` → `{ impressions, completes, estimatedSupportUsd }`. `estimatedSupportUsd` uses a placeholder rate (`ESTIMATED_REVENUE_PER_COMPLETE = $0.004/complete`) until a network reports real revenue.

## Persistence

- Ad events append to `server/data/ad-events.json` (git-ignored). Writes are serialized through a promise queue to avoid interleaved file writes. Everything else is stateless; user data lives client-side in localStorage for now.

## Roadmap / not yet built

- Real ad network + payments/payouts (needs business accounts).
- Server-side user accounts & database (would move library/reviews off localStorage).
- Ubisoft library import (no public API exists today; only account linking is stored client-side).
