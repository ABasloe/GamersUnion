import express from 'express';
import cors from 'cors';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = Number(process.env.PORT ?? 8787);
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const SELF_URL = process.env.SELF_URL ?? `http://localhost:${PORT}`;
const STEAM_API_KEY = process.env.STEAM_API_KEY;

const STEAM_OPENID = 'https://steamcommunity.com/openid/login';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, steamApiConfigured: Boolean(STEAM_API_KEY) });
});

/**
 * Steam sign-in via OpenID 2.0 (Steam's official third-party login).
 * No API key needed for login itself — key is only needed to fetch libraries.
 */
app.get('/auth/steam', (_req, res) => {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': `${SELF_URL}/auth/steam/return`,
    'openid.realm': SELF_URL,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });
  res.redirect(`${STEAM_OPENID}?${params.toString()}`);
});

app.get('/auth/steam/return', async (req, res) => {
  try {
    // Verify the assertion directly with Steam (check_authentication),
    // so a forged redirect can't link an arbitrary SteamID.
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) params.set(key, String(value));
    params.set('openid.mode', 'check_authentication');

    const verifyRes = await fetch(STEAM_OPENID, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const verifyText = await verifyRes.text();
    const valid = verifyText.includes('is_valid:true');

    const claimedId = String(req.query['openid.claimed_id'] ?? '');
    const match = claimedId.match(/^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/);

    if (!valid || !match) {
      res.redirect(`${FRONTEND_URL}/#/profile?steam_error=verification_failed`);
      return;
    }

    const steamId = match[1];
    let persona = '';
    if (STEAM_API_KEY) {
      try {
        const summaryRes = await fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`,
        );
        const summary = (await summaryRes.json()) as {
          response?: { players?: { personaname?: string }[] };
        };
        persona = summary.response?.players?.[0]?.personaname ?? '';
      } catch {
        // persona is cosmetic; linking still succeeds without it
      }
    }

    const query = new URLSearchParams({ steamid: steamId });
    if (persona) query.set('persona', persona);
    res.redirect(`${FRONTEND_URL}/#/profile?${query.toString()}`);
  } catch (err) {
    console.error('Steam OpenID verification failed:', err);
    res.redirect(`${FRONTEND_URL}/#/profile?steam_error=verification_failed`);
  }
});

/** Owned-games proxy: the Steam Web API blocks browser CORS, so it must go through us. */
app.get('/api/steam/library/:steamId', async (req, res) => {
  const { steamId } = req.params;
  if (!/^\d{17}$/.test(steamId)) {
    res.status(400).json({ error: 'invalid_steamid', message: 'SteamID must be a 17-digit SteamID64.' });
    return;
  }
  if (!STEAM_API_KEY) {
    res.status(501).json({
      error: 'steam_api_key_missing',
      message:
        'The server has no STEAM_API_KEY configured. Get a free key at https://steamcommunity.com/dev/apikey and set the STEAM_API_KEY environment variable, then restart the server.',
    });
    return;
  }
  try {
    const url =
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}` +
      `&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`;
    const steamRes = await fetch(url);
    if (!steamRes.ok) {
      res.status(502).json({ error: 'steam_api_error', message: `Steam API returned ${steamRes.status}.` });
      return;
    }
    const data = (await steamRes.json()) as {
      response?: { game_count?: number; games?: { appid: number; name?: string; playtime_forever: number }[] };
    };
    const games = (data.response?.games ?? []).map((g) => ({
      appid: g.appid,
      name: g.name ?? `App ${g.appid}`,
      hours: Math.round((g.playtime_forever / 60) * 10) / 10,
    }));
    if (games.length === 0 && !data.response?.game_count) {
      res.json({ games, note: 'Empty response — the profile may be private (Game details must be public).' });
      return;
    }
    res.json({ games });
  } catch (err) {
    console.error('Steam library fetch failed:', err);
    res.status(502).json({ error: 'steam_api_error', message: 'Could not reach the Steam Web API.' });
  }
});

/* ------------------------------------------------------------------ */
/* Support-us ads.                                                     */
/* House ads + server-side impression/completion tracking, persisted   */
/* to disk. Swapping in a real ad network (AdSense, Unity Ads, etc.)   */
/* later only means replacing the AD_POOL source — the event tracking, */
/* stats, and frontend contract stay identical.                        */
/* ------------------------------------------------------------------ */

interface AdEvent {
  adId: string;
  type: 'impression' | 'complete';
  at: string;
}

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'ad-events.json');
// Placeholder eCPM used for the "estimated support" figure until a real
// network reports actual revenue.
const ESTIMATED_REVENUE_PER_COMPLETE = 0.004;

const AD_POOL = [
  { id: 'house-merch', sponsor: 'GamersUnion', title: 'GamersUnion Merch (someday)', body: 'Imaginary hoodies for a very real community. This house ad funds nothing yet — but it proves the pipes work.', durationSec: 15 },
  { id: 'house-invite', sponsor: 'GamersUnion', title: 'Bring a friend to the fires', body: 'The site gets better with every reviewer. Send someone your profile.', durationSec: 10 },
  { id: 'house-deck', sponsor: 'GamersUnion', title: 'Tried the Deck yet?', body: 'One game at a time, dealt with a reason. Your next favorite is a few cards in.', durationSec: 10 },
  { id: 'house-backlog', sponsor: 'GamersUnion', title: 'Your backlog misses you', body: 'That game from the Steam sale of 2023 is still waiting. Log it, rate it, free yourself.', durationSec: 12 },
];

let adEvents: AdEvent[] = [];
let eventsLoaded = false;
let persistQueue: Promise<void> = Promise.resolve();

async function loadEvents() {
  if (eventsLoaded) return;
  try {
    adEvents = JSON.parse(await fs.readFile(EVENTS_FILE, 'utf8')) as AdEvent[];
  } catch {
    adEvents = [];
  }
  eventsLoaded = true;
}

function persistEvents() {
  persistQueue = persistQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(EVENTS_FILE, JSON.stringify(adEvents, null, 2));
  }).catch((err) => console.error('Failed to persist ad events:', err));
}

function adStats() {
  const impressions = adEvents.filter((e) => e.type === 'impression').length;
  const completes = adEvents.filter((e) => e.type === 'complete').length;
  return {
    impressions,
    completes,
    estimatedSupportUsd: Math.round(completes * ESTIMATED_REVENUE_PER_COMPLETE * 100) / 100,
  };
}

let adCursor = 0;
app.get('/api/ads/next', async (_req, res) => {
  await loadEvents();
  const ad = AD_POOL[adCursor % AD_POOL.length];
  adCursor += 1;
  res.json({ ad, stats: adStats() });
});

app.post('/api/ads/:adId/event', async (req, res) => {
  await loadEvents();
  const { adId } = req.params;
  const type = (req.body as { type?: string } | undefined)?.type;
  if (!AD_POOL.some((a) => a.id === adId)) {
    res.status(404).json({ error: 'unknown_ad' });
    return;
  }
  if (type !== 'impression' && type !== 'complete') {
    res.status(400).json({ error: 'invalid_type', message: "type must be 'impression' or 'complete'." });
    return;
  }
  adEvents.push({ adId, type, at: new Date().toISOString() });
  persistEvents();
  res.json({ ok: true, stats: adStats() });
});

app.get('/api/ads/stats', async (_req, res) => {
  await loadEvents();
  res.json(adStats());
});

app.listen(PORT, () => {
  console.log(`GamersUnion server on ${SELF_URL} (frontend: ${FRONTEND_URL})`);
  console.log(STEAM_API_KEY ? 'Steam API key configured.' : 'No STEAM_API_KEY set — Steam login works, library import will return 501.');
});
