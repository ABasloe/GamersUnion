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
- **Design tester** — the 🎨 switcher in the header toggles the whole site between complete design directions (Midnight / Daylight / Arcade) for UX comparison.

All state persists in localStorage. See `docs/FEATURES.md` for the feature tracker.

## Running

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in web/dist
```

Built with React + Vite + TypeScript.
