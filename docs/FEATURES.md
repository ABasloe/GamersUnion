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

## Design tester (second request)
- ✅ Built-in visual UX/UI design switcher (theme-switcher style, but swaps entire base styling)
- ✅ Multiple distinct designs: Midnight (dark), Daylight (light/Goodreads-ish), Arcade (retro CRT)
- ✅ Toggle accessible from the site header; choice persisted across reloads

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
