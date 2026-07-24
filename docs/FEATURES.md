# GamersUnion — Feature Tracker

Status legend: ✅ done · 🔲 todo

## Core site (from Ideas.md — Goodreads/MAL/Letterboxd for games)
- ✅ React + Vite + TypeScript app scaffold (`web/`)
- ✅ Home page with gaming news + top trending games
- ✅ Game tracking: played / currently playing / want to play / on hold / dropped
- ✅ Personal ratings (10-point, star UI) and hours played
- ✅ Per-game review board (write, like, delete reviews)
- ✅ Per-game discussion page (threads + replies)
- ✅ Groups: discussion board mixed with review board, join/leave, LFG-style posts
- ✅ Top 3 favorite games on profile (Letterboxd-style)
- ✅ Steam import (demo mode — imports sample library with hours; real OAuth needs a backend)
- ✅ Similarity score recommendations based on tags of rated/favorited games
- ✅ Browse page with search, tag filter, and sorting
- ✅ My Games library page with stats and filters
- ✅ State persisted in localStorage

## Design tester (second request, reworked per feedback)
- ✅ Built-in visual UX/UI design switcher accessible from the site UI; choice persisted
- ✅ v2: each design is a COMPLETE separate website implementation (own folder, own layout/components), not just CSS overrides
- ✅ Design registry + context (`web/src/designs/`), routes swap wholesale per design
- ✅ Signal — angular dark design, notched corners, no rounded-rectangle soup, blue/teal palette (replaces the old gold/yellow theme per feedback)
- ✅ Atlas — editorial light Goodreads-like design (Tailwind: newspaper masthead, horizontal shelves, article-style game pages, ink/emerald/paper palette — no yellow/orange)
- ✅ Holo — futuristic dashboard design (Tailwind: fixed left sidebar, bento stat panels, glassy violet→cyan accents)
- ✅ Tailwind CSS v4 installed and wired into Vite

## Wireframe-driven design (fourth request)
- ✅ Pre-design plan + interactive grayscale wireframe kit (4 concepts; see docs/DesignPlan.md)
- ✅ Hearth design — combines the chosen concepts into one site: River home feed, Campfire "Fires" forum with logbook drawer, TikTok-style /deck card feed with library filmstrip
- ✅ Extensible design routes (`extras` on DesignDefinition) + discriminated-union feed items — room for future features
- ✅ Identity styling: warm charcoal/ivory ground; color only as meaning (ember = community heat, sage = you); no purple/blue, no newspaper, no rule-of-three rhythms

## Launcher account linking (third request)
- ✅ Backend (`server/`, Express + TypeScript): Steam OpenID sign-in + Steam Web API library proxy
- ✅ "Sign in through Steam" flow — real OpenID 2.0 with server-side verification
- ✅ Manual SteamID64 linking as fallback
- ✅ Real library import: maps Steam appids to catalog, syncs hours to My Games, reports unmatched count
- ✅ Graceful degradation: clear message + demo import when STEAM_API_KEY isn't configured
- ✅ Ubisoft Connect account linking (no public library API exists, so import is honestly marked unavailable)
- ✅ Vite dev proxy so frontend talks to backend on relative URLs
- 🔲 Real import needs a `STEAM_API_KEY` env var on the server (free: steamcommunity.com/dev/apikey) — user action
- 🔲 Future: GOG/Epic linking, persistent server-side accounts

## Housekeeping
- ✅ Remove Vite template boilerplate
- ✅ Production build passes (`npm run build`)
- ✅ Committed and pushed to master
