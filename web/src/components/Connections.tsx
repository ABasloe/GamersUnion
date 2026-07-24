import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { getGameBySteamAppId } from '../data/games';

interface SteamApiGame {
  appid: number;
  name: string;
  hours: number;
}

/**
 * Launcher account linking. Steam uses the real flow: OpenID sign-in via the
 * backend (/auth/steam) plus a Steam Web API proxy for the owned-games list.
 * Ubisoft Connect has no public library API, so linking stores the account and
 * imports are marked unavailable rather than faked.
 */
export function Connections() {
  const app = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [manualId, setManualId] = useState('');
  const [ubiName, setUbiName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Complete the OpenID round-trip: backend redirects here with ?steamid=...
  useEffect(() => {
    const steamid = searchParams.get('steamid');
    const persona = searchParams.get('persona') ?? undefined;
    const error = searchParams.get('steam_error');
    if (steamid && /^\d{17}$/.test(steamid)) {
      app.linkSteam(steamid, persona);
      setMessage({ kind: 'ok', text: `Steam account linked${persona ? ` as ${persona}` : ''}.` });
      setSearchParams({}, { replace: true });
    } else if (error) {
      setMessage({ kind: 'err', text: 'Steam sign-in could not be verified. Please try again.' });
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const steam = app.connections.steam;
  const ubisoft = app.connections.ubisoft;

  const importLibrary = async () => {
    if (!steam) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/steam/library/${steam.steamId}`);
      const data = (await res.json()) as { games?: SteamApiGame[]; note?: string; message?: string; error?: string };
      if (!res.ok) {
        if (data.error === 'steam_api_key_missing') {
          setMessage({
            kind: 'err',
            text: 'The server has no Steam API key configured, so a real import is unavailable. You can use the demo import below, or configure STEAM_API_KEY on the server (free at steamcommunity.com/dev/apikey).',
          });
        } else {
          setMessage({ kind: 'err', text: data.message ?? 'Import failed — is the backend running? (npm run dev in server/)' });
        }
        return;
      }
      const games = data.games ?? [];
      const matched: { gameId: string; hours: number }[] = [];
      for (const g of games) {
        const game = getGameBySteamAppId(g.appid);
        if (game) matched.push({ gameId: game.id, hours: g.hours });
      }
      app.applySteamLibrary(matched, games.length - matched.length);
      setMessage({
        kind: 'ok',
        text:
          games.length === 0
            ? (data.note ?? 'Steam returned no games — the profile may be private.')
            : `Imported ${matched.length} of ${games.length} Steam games into your library (${games.length - matched.length} not yet in our catalog).`,
      });
    } catch {
      setMessage({ kind: 'err', text: 'Could not reach the backend. Start it with "npm run dev" in the server/ folder.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <h2>🔗 Connected Accounts</h2>
      {message && <p className={message.kind === 'ok' ? 'msg-ok' : 'msg-err'}>{message.text}</p>}

      <div className="connection-card">
        <div className="connection-head">
          <h3>Steam</h3>
          {steam && <span className="tag tag-steam">linked</span>}
        </div>
        {steam ? (
          <>
            <p className="muted">
              {steam.personaName ? `${steam.personaName} · ` : ''}SteamID {steam.steamId} · linked {steam.linkedAt}
              {steam.lastImport && ` · last import: ${steam.lastImport.matched} games (${steam.lastImport.date})`}
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={importLibrary} disabled={busy}>
                {busy ? 'Importing…' : 'Import Steam Library'}
              </button>
              <button className="btn" onClick={() => app.unlinkSteam()}>Unlink</button>
            </div>
          </>
        ) : (
          <>
            <p>Sign in through Steam to link your account, then import your games and hours played.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="/auth/steam">Sign in through Steam</a>
            </div>
            <details className="manual-link">
              <summary className="muted">Or link manually with your SteamID64</summary>
              <div className="reply-row">
                <input
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value.trim())}
                  placeholder="17-digit SteamID64, e.g. 76561198000000000"
                />
                <button
                  className="btn"
                  disabled={!/^\d{17}$/.test(manualId)}
                  onClick={() => { app.linkSteam(manualId); setManualId(''); setMessage({ kind: 'ok', text: 'Steam account linked.' }); }}
                >
                  Link
                </button>
              </div>
            </details>
          </>
        )}
      </div>

      <div className="connection-card">
        <div className="connection-head">
          <h3>Ubisoft Connect</h3>
          {ubisoft && <span className="tag tag-steam">linked</span>}
        </div>
        {ubisoft ? (
          <>
            <p className="muted">{ubisoft.username} · linked {ubisoft.linkedAt}</p>
            <p className="muted">
              Ubisoft doesn't offer a public library API, so automatic import isn't available yet —
              your linked account will sync as soon as they open one up.
            </p>
            <button className="btn" onClick={() => app.unlinkUbisoft()}>Unlink</button>
          </>
        ) : (
          <>
            <p>Link your Ubisoft Connect username to your profile.</p>
            <div className="reply-row">
              <input value={ubiName} onChange={(e) => setUbiName(e.target.value)} placeholder="Ubisoft username" />
              <button
                className="btn"
                disabled={!ubiName.trim()}
                onClick={() => { app.linkUbisoft(ubiName.trim()); setUbiName(''); }}
              >
                Link
              </button>
            </div>
          </>
        )}
      </div>

      {!app.steamImported && (
        <div className="connection-card">
          <div className="connection-head"><h3>Demo import</h3></div>
          <p className="muted">
            No backend or API key handy? Load a sample Steam library to try the feature. Games land
            in <Link to="/library">My Games</Link> with hours played.
          </p>
          <DemoImportButton />
        </div>
      )}
    </section>
  );
}

function DemoImportButton() {
  const app = useApp();
  const [importing, setImporting] = useState(false);
  return (
    <button
      className="btn"
      disabled={importing}
      onClick={() => {
        setImporting(true);
        setTimeout(() => { app.importSteam(); setImporting(false); }, 800);
      }}
    >
      {importing ? 'Importing…' : 'Import Sample Library'}
    </button>
  );
}
