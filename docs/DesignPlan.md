# Design Plan — next-generation layouts (pre-design phase)

Interactive wireframe kit: https://claude.ai/code/artifact/ae033eea-a724-49b3-9d49-7b79fbe37fec

## Principles (from feedback)
- No newspaper-styled designs; no purple/blue-gradient identities.
- Color is seasoning, not structure — wireframes are judged in grayscale first; if a layout only works painted, it fails.
- Content FLOW drives layout: each screen privileges exactly one action and states why content was shown.
- Avoid rule-of-three composition (no default grids-of-three, three-column heroes, triple card rows); let counts and rhythm come from the content itself.
- Be out-of-the-box structurally, not decoratively.

## The four wireframed concepts
1. **River** — the whole product is one endless interleaved feed (your sessions, reviews, threads, trending) with inline expansion; a 5-second session logger is the anchor ritual; a sticky "mini-you" rail is the only fixed furniture.
2. **Dossier** — two-pane master–detail everywhere; a type-to-hunt index on the left drives a live dossier pane on the right; zero page loads; "peek" stacking for similarity-chain browsing.
3. **Deck** — anti-grid: full-bleed cards dealt one at a time with a stated reason per deal; skipping trains it; the library is a horizontal filmstrip docked at the bottom.
4. **Campfire** — conversation-first inversion: home is live conversations sized by heat (area = participation); games attach as trackable chips inside threads; personal tracking is a pull-up logbook drawer.

## Process
1. User clicks through the wireframes and kills at least one concept.
2. Survivors each get a palette + type pairing derived from their own concept (never trend defaults), then are built as full designs under `web/src/designs/` next to Signal/Atlas/Holo.
3. Acceptance test per build: remove the color and the layout must still guide the user.

## Studio recommendation
Take **River** (momentum) + **Dossier** (control) if only two graduate; **Deck** is the high-risk/high-signature pick; **Campfire** is the boldest reframe but buries tracking one level deep.

Status: 🔲 awaiting concept selection before any visual design begins.
