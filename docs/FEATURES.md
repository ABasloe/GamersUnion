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

## Union flagship design (sixth request — web-design skill rehaul)
- ✅ Union design: merges the liked pieces — angular notched geometry app-wide, River home, Fires forum, Deck feed, Signal-style Browse, Support page — one token system, each section keeps its layout identity
- ✅ Skill compliance: zero emojis, no gradients (hard two-tone cover plates + type monograms), no newspaper, no purple/blue, no rule-of-three groupings
- ✅ Real typography: Chakra Petch display / Public Sans body / IBM Plex Mono data (self-hosted via fontsource)
- ✅ Signature element: "the current" — river spine line on Home, reappearing as ember heat gauges at the Fires
- ✅ Union is now the ONLY design — Signal/Atlas/Holo/Hearth deleted per feedback ("they are all ass")
- ✅ Design switcher replaced by a THEME picker for Union: Graphite (neutral dark, default), Pine, Void, Porcelain (light) — CSS-variable tokens, persisted choice
- ✅ Brown/orange background hue removed; ground colors are neutral (heat accent is now ember red, not copper)

## Support-us ads (fifth request)
- ✅ Backend ad service: GET /api/ads/next (rotating house ads), POST /api/ads/:id/event (impression/complete), GET /api/ads/stats; events persisted to server/data/ad-events.json
- ✅ /support page in every design: ad player with countdown + progress bar, community stats (views, estimated support)
- ✅ Nav link ("Support") added to all four designs
- 🔲 Sign up with a real ad network (AdSense/Unity/etc.) and swap the AD_POOL source — requires business account, user action
- 🔲 Payments/payouts integration once a network reports real revenue

## Gamified support hub (seventh request)
- ✅ Watching ads earns raffle tickets (+1) and points (+10) per completed view — anonymous supporterId, no account needed
- ✅ Steam-key raffles: seeded giveaways, spend tickets for entries, entries tracked server-side for manual draws
- ✅ Points redemption: supporter badges (instant) and Steam gift cards (queued for manual fulfillment)
- ✅ Fully isolated to the /support section — no other page or store touched
- 🔲 Actually buy Steam keys/gift cards and draw winners from server/data/rewards.json — operator action

## Housekeeping
- ✅ Remove Vite template boilerplate
- ✅ Production build passes (`npm run build`)
- ✅ Committed and pushed to master
