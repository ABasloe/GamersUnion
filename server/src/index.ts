import express from 'express';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT ?? 8787);
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const SELF_URL = process.env.SELF_URL ?? `http://localhost:${PORT}`;
const STEAM_API_KEY = process.env.STEAM_API_KEY;

const STEAM_OPENID = 'https://steamcommunity.com/openid/login';

app.use(cors({ origin: FRONTEND_URL }));

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

app.listen(PORT, () => {
  console.log(`GamersUnion server on ${SELF_URL} (frontend: ${FRONTEND_URL})`);
  console.log(STEAM_API_KEY ? 'Steam API key configured.' : 'No STEAM_API_KEY set — Steam login works, library import will return 501.');
});
