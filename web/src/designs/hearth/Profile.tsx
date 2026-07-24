import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { getGame, getGameBySteamAppId } from '../../data/games';
import { Cover, EMBER, SAGE, ghostBtn, inputCls, Hairline } from './ui';

export function Profile() {
  const app = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(app.username);

  const favorites = app.favorites.map(getGame).filter((g) => g != null);
  const myReviews = app.reviews.filter((r) => r.isMine);
  const joined = app.groups.filter((g) => g.joined);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      {editing ? (
        <div className="flex max-w-sm gap-2">
          <input className={`${inputCls} flex-1`} value={name} onChange={(e) => setName(e.target.value)} />
          <button className={ghostBtn} onClick={() => { app.setUsername(name.trim() || 'Player One'); setEditing(false); }}>keep</button>
        </div>
      ) : (
        <h1 className="font-serif text-2xl italic text-stone-100">
          {app.username}{' '}
          <button className="cursor-pointer border-none bg-transparent p-0 align-middle text-xs text-stone-500 hover:text-stone-300" onClick={() => setEditing(true)}>
            rename
          </button>
        </h1>
      )}
      <p className="mt-1 text-sm text-stone-500 tabular-nums">
        {app.library.length} games logged · {myReviews.length} voices · {joined.length} fires sat at
      </p>

      <Hairline />

      <p className="text-xs" style={{ color: SAGE }}>carried closest</p>
      {favorites.length === 0 ? (
        <p className="mt-2 text-sm text-stone-500">
          You haven't chosen what you carry — on any game page, “carry it closest.”
        </p>
      ) : (
        <div className="mt-3 flex items-end gap-5">
          {favorites.map((g, i) => (
            <Link key={g.id} to={`/game/${g.id}`} className="text-center">
              <Cover game={g} className={i === 0 ? 'h-40 w-28' : i === 1 ? 'h-32 w-[88px]' : 'h-28 w-20'} />
              <span className="mt-1 block text-[11px] text-stone-500">{['first', 'second', 'third'][i]}</span>
            </Link>
          ))}
        </div>
      )}

      <Hairline />
      <ConnectionsPanel />
      <Hairline />

      <p className="text-xs" style={{ color: SAGE }}>your voices</p>
      <div className="mt-3 space-y-5">
        {myReviews.length === 0 && <p className="text-sm text-stone-500">Nothing said yet.</p>}
        {myReviews.map((r) => (
          <div key={r.id} className="border-l pl-4" style={{ borderColor: SAGE }}>
            <p className="font-serif text-[16px] text-stone-200">“{r.text}”</p>
            <p className="mt-1 text-xs text-stone-500">
              on <Link to={`/game/${r.gameId}`} className="text-stone-300 underline-offset-4 hover:underline">{getGame(r.gameId)?.title}</Link>{' '}
              · <span className="tabular-nums">{r.rating}/10</span> · {r.date} · △ <span className="tabular-nums">{r.likes}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SteamApiGame { appid: number; name: string; hours: number }

function ConnectionsPanel() {
  const app = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [manualId, setManualId] = useState('');
  const [ubiName, setUbiName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const steamid = searchParams.get('steamid');
    const persona = searchParams.get('persona') ?? undefined;
    const error = searchParams.get('steam_error');
    if (steamid && /^\d{17}$/.test(steamid)) {
      app.linkSteam(steamid, persona);
      setMsg({ ok: true, text: `Steam linked${persona ? ` as ${persona}` : ''}.` });
      setSearchParams({}, { replace: true });
    } else if (error) {
      setMsg({ ok: false, text: 'Steam sign-in could not be verified. Try again.' });
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const steam = app.connections.steam;
  const ubisoft = app.connections.ubisoft;

  const importLibrary = async () => {
    if (!steam) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/steam/library/${steam.steamId}`);
      const data = (await res.json()) as { games?: SteamApiGame[]; note?: string; message?: string; error?: string };
      if (!res.ok) {
        setMsg({
          ok: false,
          text:
            data.error === 'steam_api_key_missing'
              ? 'No Steam API key on the server — real import unavailable. Use the sample import below, or set STEAM_API_KEY (free at steamcommunity.com/dev/apikey).'
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
      setMsg({
        ok: true,
        text:
          games.length === 0
            ? (data.note ?? 'Steam returned no games — the profile may be private.')
            : `Imported ${matched.length} of ${games.length} Steam games (${games.length - matched.length} not in the catalog yet).`,
      });
    } catch {
      setMsg({ ok: false, text: 'Could not reach the backend. Start it with "npm run dev" in server/.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="text-xs" style={{ color: SAGE }}>tethered accounts</p>
      {msg && <p className="mt-2 text-sm" style={{ color: msg.ok ? SAGE : EMBER }}>{msg.text}</p>}

      <div className="mt-3 space-y-6">
        <div>
          <p className="text-[15px] text-stone-200">Steam {steam && <span className="text-xs" style={{ color: SAGE }}>· linked</span>}</p>
          {steam ? (
            <>
              <p className="mt-1 text-xs text-stone-500 tabular-nums">
                {steam.personaName ? `${steam.personaName} · ` : ''}{steam.steamId} · since {steam.linkedAt}
                {steam.lastImport && ` · last haul: ${steam.lastImport.matched} games (${steam.lastImport.date})`}
              </p>
              <div className="mt-2 flex gap-2">
                <button className={ghostBtn} onClick={importLibrary} disabled={busy}>{busy ? 'hauling…' : 'import library'}</button>
                <button className={ghostBtn} onClick={() => app.unlinkSteam()}>untether</button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <a className={ghostBtn} href="/auth/steam">sign in through Steam</a>
                <span className="text-xs text-stone-600">or</span>
                <input
                  className={`${inputCls} w-64`} placeholder="17-digit SteamID64"
                  value={manualId} onChange={(e) => setManualId(e.target.value.trim())}
                />
                <button
                  className={ghostBtn}
                  disabled={!/^\d{17}$/.test(manualId)}
                  onClick={() => { app.linkSteam(manualId); setManualId(''); setMsg({ ok: true, text: 'Steam linked.' }); }}
                >
                  tether
                </button>
              </div>
              {!app.steamImported && (
                <button
                  className="mt-2 cursor-pointer border-none bg-transparent p-0 text-xs text-stone-500 underline underline-offset-4 hover:text-stone-300"
                  onClick={() => app.importSteam()}
                >
                  no key handy? load a sample library instead
                </button>
              )}
            </>
          )}
        </div>

        <div>
          <p className="text-[15px] text-stone-200">Ubisoft Connect {ubisoft && <span className="text-xs" style={{ color: SAGE }}>· linked</span>}</p>
          {ubisoft ? (
            <>
              <p className="mt-1 text-xs text-stone-500">
                {ubisoft.username} · since {ubisoft.linkedAt} — Ubisoft has no public library API yet; the tether waits for one.
              </p>
              <button className={`${ghostBtn} mt-2`} onClick={() => app.unlinkUbisoft()}>untether</button>
            </>
          ) : (
            <div className="mt-2 flex gap-2">
              <input className={`${inputCls} w-64`} placeholder="Ubisoft username" value={ubiName} onChange={(e) => setUbiName(e.target.value)} />
              <button className={ghostBtn} disabled={!ubiName.trim()} onClick={() => { app.linkUbisoft(ubiName.trim()); setUbiName(''); }}>
                tether
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
