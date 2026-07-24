# GamersUnion

Goodreads / MyAnimeList / Letterboxd — but for video games. Track what you've played, rate it, review it, discuss it, and find groups to play with.

## Features

- **Home** — gaming news feed, top trending games, fresh community reviews, and personalized recommendations.
- **Browse** — search, filter by tag, sort by trending / rating / year.
- **Game pages** — community rating, your status (Playing / Played / Want to Play / On Hold / Dropped), 10-point star rating, hours played, plus a **review board** and a **discussion board** per game.
- **My Games** — your library with stats (total hours, average rating) and status filters.
- **Groups** — discussion boards mixed with review clubs; join groups and post to find people to play with.
- **Profile** — Letterboxd-style Top 3 favorites, your reviews, and **Steam import** (demo mode) that syncs games and hours played.
- **Similarity score** — tag-based recommendations from what you've rated and favorited.
- **Theme picker** — the header selector swaps the Union design's palette: Graphite, Pine, Void, or Porcelain (light).
- **Deck** — a one-card-at-a-time discovery feed at /deck; the River home feed and the Fires forum round out the Union design.

All state persists in localStorage. See `docs/FEATURES.md` for the feature tracker.

- **Account linking** — sign in through Steam (real OpenID) and import your library with hours played; Ubisoft Connect account linking.

## Running

Frontend:

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in web/dist
```

Backend (Steam login + library import):

```bash
cd server
npm install
npm run dev      # http://localhost:8787 (frontend proxies /api and /auth to it)
```

Steam sign-in works out of the box. For real library import, set a free Steam Web API key
(https://steamcommunity.com/dev/apikey) before starting the server:

```powershell
$env:STEAM_API_KEY = "YOUR_KEY"; npm run dev
```

Without a key, the site clearly says so and offers a demo import instead.

Built with React + Vite + TypeScript, Express on the server.
