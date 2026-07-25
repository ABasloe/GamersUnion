import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { getGame, getGameBySteamAppId } from '../../data/games';
import { Btn, Chip, Cover, DISPLAY, EMBER, LINE, MONO, MOSS, MUTED, Panel, TEXT, focusRing, inputCls } from './ui';

export function Profile() {
  const app = useApp();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(app.username);

  const favorites = app.favorites.map(getGame).filter((g) => g != null);
  const myReviews = app.reviews.filter((r) => r.isMine);
  const joinedGroups = app.groups.filter((g) => g.joined);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="flex flex-wrap items-center gap-4">
        {editingName ? (
          <span className="flex items-center gap-2">
            <input className={`${inputCls} w-56`} value={name} onChange={(e) => setName(e.target.value)} />
            <Btn primary onClick={() => { app.setUsername(name.trim() || 'Player One'); setEditingName(false); }}>
              save name
            </Btn>
          </span>
        ) : (
          <h1 className="text-2xl font-semibold" style={DISPLAY}>
            {app.username}{' '}
            <button
              className={`cursor-pointer border-none bg-transparent p-0 text-xs ${focusRing}`}
              style={{ color: MUTED }}
              onClick={() => setEditingName(true)}
            >
              edit
            </button>
          </h1>
        )}
        <p className="text-xs" style={{ color: MUTED, ...MONO }}>
          {app.library.length} games · {myReviews.length} reviews · {joinedGroups.length} boards
        </p>
      </div>

      <section className="mt-8">
        <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: MUTED, ...DISPLAY }}>carried closest</p>
        {favorites.length === 0 ? (
          <p className="mt-2 text-sm" style={{ color: MUTED }}>
            No favorites yet — open a game page and add it to your top 3.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {favorites.map((g, i) => (
              <Link
                key={g.id}
                to={`/game/${g.id}`}
                className={`flex items-center gap-4 ${focusRing}`}
                style={{ marginLeft: `${i * 28}px` }}
              >
                <span className="w-8 text-2xl" style={{ ...DISPLAY, color: MOSS }}>{i + 1}</span>
                <Cover game={g} className="h-24 w-[68px]" />
                <span className="text-[15px] font-semibold underline-offset-4 hover:underline" style={{ ...DISPLAY, color: TEXT }}>
                  {g.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <TetheredAccounts />

      <section className="mt-10">
        <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: MUTED, ...DISPLAY }}>your reviews</p>
        {myReviews.length === 0 ? (
          <p className="mt-2 text-sm" style={{ color: MUTED }}>You haven't reviewed anything yet.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {myReviews.map((r) => (
              <div key={r.id} className="pl-4" style={{ borderLeft: `2px solid ${MOSS}` }}>
                <p className="text-sm">
                  <Link to={`/game/${r.gameId}`} className={`font-semibold underline-offset-4 hover:underline ${focusRing}`} style={{ ...DISPLAY, color: TEXT }}>
                    {getGame(r.gameId)?.title}
                  </Link>{' '}
                  <span style={{ color: MUTED, ...MONO }}>{r.rating}/10 · {r.date} · {r.likes} lifts</span>
                </p>
                <p className="mt-1 max-w-2xl text-sm" style={{ color: TEXT }}>{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tethered accounts — same logic as components/Connections.tsx,       */
/* restyled for Union.                                                 */
/* ------------------------------------------------------------------ */

interface SteamApiGame {
  appid: number;
  name: string;
  hours: number;
}

function TetheredAccounts() {
  const app = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [manualId, setManualId] = useState('');
  const [ubiName, setUbiName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    const steamid = searchParams.get('steamid');
    const persona = searchParams.get('persona') ?? undefined;
    const error = searchParams.get('steam_error');
    if (steamid && /^\d{17}$/.test(steamid)) {
      app.linkSteam(steamid, persona);
      setMessage({ kind: 'ok', text: `Steam account linked${persona ? ` as ${persona}` : ''}.` });
      setSearchParams({}, { replace: true });
    } else if (error) {
      setMessage({ kind: 'err', text: 'Steam sign-in could not be verified. Try again.' });
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const steam = app.connections.steam;
  const ubisoft = app.connections.ubisoft;

  const importLibrary = useCallback(async () => {
    if (!steam) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/steam/library/${steam.steamId}`);
      const data = (await res.json()) as { games?: SteamApiGame[]; note?: string; message?: string; error?: string };
      if (!res.ok) {
        setMessage({
          kind: 'err',
          text:
            data.error === 'steam_api_key_missing'
              ? 'The server has no Steam API key, so a real import is unavailable. Use the sample import below, or set STEAM_API_KEY on the server.'
              : (data.message ?? 'Import failed — is the backend running? (npm run dev in server/)'),
        });
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
            : `Imported ${matched.length} of ${games.length} Steam games (${games.length - matched.length} not in our catalog yet).`,
      });
    } catch {
      setMessage({ kind: 'err', text: 'Could not reach the backend. Start it with "npm run dev" in server/.' });
    } finally {
      setBusy(false);
    }
  }, [app, steam]);

  return (
    <section className="mt-10">
      <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: MUTED, ...DISPLAY }}>tethered accounts</p>
      {message && (
        <p className="mt-2 text-sm" style={{ color: message.kind === 'ok' ? MOSS : 'var(--gu-danger)' }}>{message.text}</p>
      )}

      <Panel edge={MOSS} className="mt-3 p-4">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold" style={DISPLAY}>Steam</p>
          {steam && <Chip color={MOSS}>linked</Chip>}
        </div>
        {steam ? (
          <>
            <p className="mt-1 text-xs" style={{ color: MUTED, ...MONO }}>
              {steam.personaName ? `${steam.personaName} · ` : ''}id {steam.steamId} · linked {steam.linkedAt}
              {steam.lastImport && ` · last import ${steam.lastImport.matched} games (${steam.lastImport.date})`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn primary disabled={busy} onClick={importLibrary}>{busy ? 'importing' : 'import steam library'}</Btn>
              <Btn onClick={() => app.unlinkSteam()}>unlink</Btn>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm" style={{ color: MUTED }}>
              Sign in through Steam, then pull your games and hours into the logbook.
            </p>
            <div className="mt-3">
              <a
                href="/auth/steam"
                className={`inline-block cursor-pointer border px-3.5 py-1.5 text-sm ${focusRing}`}
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)', ...DISPLAY, borderColor: MOSS, background: MOSS, color: 'var(--gu-ground)' }}
              >
                sign in through steam
              </a>
            </div>
            <details className="mt-3">
              <summary className={`cursor-pointer text-xs ${focusRing}`} style={{ color: MUTED }}>
                or link manually with a SteamID64
              </summary>
              <div className="mt-2 flex gap-2">
                <input
                  className={`${inputCls} max-w-72`}
                  placeholder="17-digit SteamID64"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value.trim())}
                />
                <Btn
                  disabled={!/^\d{17}$/.test(manualId)}
                  onClick={() => { app.linkSteam(manualId); setManualId(''); setMessage({ kind: 'ok', text: 'Steam account linked.' }); }}
                >
                  link
                </Btn>
              </div>
            </details>
          </>
        )}
      </Panel>

      <Panel className="mt-3 p-4">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold" style={DISPLAY}>Ubisoft Connect</p>
          {ubisoft && <Chip color={MOSS}>linked</Chip>}
        </div>
        {ubisoft ? (
          <>
            <p className="mt-1 text-xs" style={{ color: MUTED, ...MONO }}>{ubisoft.username} · linked {ubisoft.linkedAt}</p>
            <p className="mt-1 text-xs" style={{ color: MUTED }}>
              Ubisoft has no public library API yet, so imports wait until they open one.
            </p>
            <div className="mt-3"><Btn onClick={() => app.unlinkUbisoft()}>unlink</Btn></div>
          </>
        ) : (
          <div className="mt-2 flex gap-2">
            <input
              className={`${inputCls} max-w-72`}
              placeholder="Ubisoft username"
              value={ubiName}
              onChange={(e) => setUbiName(e.target.value)}
            />
            <Btn disabled={!ubiName.trim()} onClick={() => { app.linkUbisoft(ubiName.trim()); setUbiName(''); }}>link</Btn>
          </div>
        )}
      </Panel>

      {!app.steamImported && (
        <Panel className="mt-3 p-4">
          <p className="text-sm font-semibold" style={DISPLAY}>Sample import</p>
          <p className="mt-1 text-xs" style={{ color: MUTED }}>
            No backend or API key handy? Load a sample Steam library into{' '}
            <Link to="/library" className={`underline underline-offset-4 ${focusRing}`} style={{ color: TEXT }}>the logbook</Link>{' '}
            to try the feature.
          </p>
          <div className="mt-3"><DemoImport /></div>
        </Panel>
      )}

      <p className="mt-3 text-xs" style={{ color: EMBER }}>
        More launchers land here as their APIs allow — the slot is ready.
      </p>
      <span aria-hidden className="mt-1 block h-px w-24" style={{ background: LINE }} />
    </section>
  );
}

function DemoImport() {
  const app = useApp();
  const [importing, setImporting] = useState(false);
  return (
    <Btn
      disabled={importing}
      onClick={() => {
        setImporting(true);
        setTimeout(() => { app.importSteam(); setImporting(false); }, 800);
      }}
    >
      {importing ? 'importing' : 'import sample library'}
    </Btn>
  );
}
