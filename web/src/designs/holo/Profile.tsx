import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { getGame, getGameBySteamAppId } from '../../data/games';
import { getRecommendations } from '../../utils/similarity';
import { Cover, GradientText, Panel, PanelTitle, Tag, btnClass, btnPrimaryClass, inputClass } from './ui';

export function Profile() {
  const app = useApp();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(app.username);

  const favorites = app.favorites.map(getGame).filter((g) => g != null);
  const myReviews = app.reviews.filter((r) => r.isMine);
  const joinedGroups = app.groups.filter((g) => g.joined);
  const recs = getRecommendations(app.library, app.favorites).slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center bg-gradient-to-br from-violet-500 to-cyan-400 text-3xl">
          👤
        </div>
        <div>
          {editingName ? (
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              <button
                className={btnPrimaryClass}
                onClick={() => {
                  app.setUsername(name.trim() || 'Player One');
                  setEditingName(false);
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <h1 className="text-2xl font-extrabold text-white">
              {app.username}{' '}
              <button
                className="cursor-pointer text-xs font-normal text-cyan-300 hover:underline"
                onClick={() => setEditingName(true)}
              >
                edit
              </button>
            </h1>
          )}
          <p className="text-sm text-slate-400">
            {app.library.length} games · {myReviews.length} reviews · {joinedGroups.length} groups
          </p>
        </div>
      </div>

      <Panel className="p-5">
        <PanelTitle>Top 3 favorites</PanelTitle>
        {favorites.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No favorites yet — open a game page and hit "Add to Top 3".
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap items-end gap-4">
            {favorites.map((g, i) => (
              <Link key={g.id} to={`/game/${g.id}`} className="group relative">
                <span className="absolute -left-2 -top-2 z-10 bg-gradient-to-r from-violet-400 to-cyan-300 px-2 py-0.5 text-xs font-black text-slate-950">
                  #{i + 1}
                </span>
                <Cover
                  game={g}
                  className={`ring-1 ring-white/15 transition group-hover:ring-cyan-400/50 ${
                    i === 0 ? 'h-48 w-36' : i === 1 ? 'h-40 w-30' : 'h-36 w-27'
                  }`}
                />
              </Link>
            ))}
          </div>
        )}
      </Panel>

      <ConnectionsPanel />

      {recs.length > 0 && (
        <Panel className="p-5">
          <PanelTitle>Similarity picks</PanelTitle>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {recs.map((r) => (
              <Link
                key={r.game.id}
                to={`/game/${r.game.id}`}
                className="bg-white/5 p-3 ring-1 ring-white/10 transition hover:ring-cyan-400/40"
              >
                <div className="text-lg font-extrabold text-cyan-300">{r.score}%</div>
                <div className="text-sm font-semibold text-slate-100">{r.game.title}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {r.matchedTags.slice(0, 2).map((t) => <Tag key={t}>{t}</Tag>)}
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      )}

      <Panel className="p-5">
        <PanelTitle>My reviews</PanelTitle>
        {myReviews.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">You haven't reviewed anything yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {myReviews.map((r) => (
              <div key={r.id} className="border-l-2 border-violet-500/60 pl-3">
                <div className="flex items-center justify-between">
                  <Link to={`/game/${r.gameId}`} className="text-sm font-semibold text-slate-100 hover:text-cyan-300">
                    {getGame(r.gameId)?.title}
                  </Link>
                  <span className="text-sm font-bold text-cyan-300">{r.rating}/10</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{r.text}</p>
                <span className="text-xs text-slate-500">{r.date} · 👍 {r.likes}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

interface SteamApiGame {
  appid: number;
  name: string;
  hours: number;
}

function ConnectionsPanel() {
  const app = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [manualId, setManualId] = useState('');
  const [ubiName, setUbiName] = useState('');
  const [busy, setBusy] = useState(false);
  const [importingDemo, setImportingDemo] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Complete the Steam OpenID round-trip: backend redirects here with ?steamid=...
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
      const data = (await res.json()) as {
        games?: SteamApiGame[];
        note?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        if (data.error === 'steam_api_key_missing') {
          setMessage({
            kind: 'err',
            text: 'The server has no Steam API key configured, so a real import is unavailable. Use the demo import below, or set STEAM_API_KEY on the server (free at steamcommunity.com/dev/apikey).',
          });
        } else {
          setMessage({
            kind: 'err',
            text: data.message ?? 'Import failed — is the backend running? (npm run dev in server/)',
          });
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
      setMessage({
        kind: 'err',
        text: 'Could not reach the backend. Start it with "npm run dev" in the server/ folder.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel className="p-5">
      <PanelTitle>Connected accounts</PanelTitle>
      {message && (
        <p className={`mt-2 text-sm font-semibold ${message.kind === 'ok' ? 'text-cyan-300' : 'text-rose-400'}`}>
          {message.text}
        </p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100">Steam</h3>
            {steam && (
              <span className="bg-cyan-400/15 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan-300 ring-1 ring-cyan-400/30">
                linked
              </span>
            )}
          </div>
          {steam ? (
            <>
              <p className="mt-1 text-xs text-slate-400">
                {steam.personaName ? `${steam.personaName} · ` : ''}SteamID {steam.steamId} · linked {steam.linkedAt}
                {steam.lastImport && ` · last import: ${steam.lastImport.matched} games (${steam.lastImport.date})`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className={btnPrimaryClass} onClick={importLibrary} disabled={busy}>
                  {busy ? 'Importing…' : 'Import Steam library'}
                </button>
                <button className={btnClass} onClick={() => app.unlinkSteam()}>
                  Unlink
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-xs text-slate-400">
                Sign in through Steam to link your account, then import games and hours.
              </p>
              <a className={`${btnPrimaryClass} mt-3 inline-block`} href="/auth/steam">
                Sign in through <GradientText>Steam</GradientText>
              </a>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-slate-500">
                  Or link manually with your SteamID64
                </summary>
                <div className="mt-2 flex gap-2">
                  <input
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value.trim())}
                    placeholder="17-digit SteamID64"
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    className={btnClass}
                    disabled={!/^\d{17}$/.test(manualId)}
                    onClick={() => {
                      app.linkSteam(manualId);
                      setManualId('');
                      setMessage({ kind: 'ok', text: 'Steam account linked.' });
                    }}
                  >
                    Link
                  </button>
                </div>
              </details>
            </>
          )}
        </div>

        <div className="bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100">Ubisoft Connect</h3>
            {ubisoft && (
              <span className="bg-cyan-400/15 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan-300 ring-1 ring-cyan-400/30">
                linked
              </span>
            )}
          </div>
          {ubisoft ? (
            <>
              <p className="mt-1 text-xs text-slate-400">
                {ubisoft.username} · linked {ubisoft.linkedAt}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Ubisoft doesn't offer a public library API, so automatic import isn't available yet — your linked
                account will sync as soon as they open one up.
              </p>
              <button className={`${btnClass} mt-3`} onClick={() => app.unlinkUbisoft()}>
                Unlink
              </button>
            </>
          ) : (
            <>
              <p className="mt-1 text-xs text-slate-400">Link your Ubisoft Connect username to your profile.</p>
              <div className="mt-3 flex gap-2">
                <input
                  value={ubiName}
                  onChange={(e) => setUbiName(e.target.value)}
                  placeholder="Ubisoft username"
                  className={`${inputClass} flex-1`}
                />
                <button
                  className={btnClass}
                  disabled={!ubiName.trim()}
                  onClick={() => {
                    app.linkUbisoft(ubiName.trim());
                    setUbiName('');
                  }}
                >
                  Link
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {!app.steamImported && (
        <div className="mt-3 bg-white/5 p-4 ring-1 ring-white/10">
          <h3 className="text-sm font-bold text-slate-100">Demo import</h3>
          <p className="mt-1 text-xs text-slate-400">
            No backend or API key handy? Load a sample Steam library — games land in{' '}
            <Link to="/library" className="text-cyan-300 hover:underline">My Games</Link> with hours played.
          </p>
          <button
            className={`${btnClass} mt-3`}
            disabled={importingDemo}
            onClick={() => {
              setImportingDemo(true);
              setTimeout(() => {
                app.importSteam();
                setImportingDemo(false);
              }, 800);
            }}
          >
            {importingDemo ? 'Importing…' : 'Import sample library'}
          </button>
        </div>
      )}
    </Panel>
  );
}
