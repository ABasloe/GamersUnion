import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { getGame, getGameBySteamAppId } from '../../data/games';
import { getRecommendations } from '../../utils/similarity';
import { Btn, Cover, SectionHeading, inputCls } from './ui';

export function Profile() {
  const app = useApp();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(app.username);

  const favorites = app.favorites.map(getGame).filter((g) => g != null);
  const myReviews = app.reviews.filter((r) => r.isMine);
  const joinedGroups = app.groups.filter((g) => g.joined);
  const recs = getRecommendations(app.library, app.favorites).slice(0, 5);

  return (
    <div className="mt-10">
      <div className="border-b-2 border-neutral-900 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-900/80">Member profile</p>
        {editingName ? (
          <div className="mt-2 flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            <Btn
              primary
              onClick={() => {
                app.setUsername(name.trim() || 'Player One');
                setEditingName(false);
              }}
            >
              Save
            </Btn>
          </div>
        ) : (
          <h1 className="mt-1 font-serif text-5xl font-black text-neutral-900">
            {app.username}{' '}
            <button onClick={() => setEditingName(true)} className="align-middle font-sans text-sm font-normal text-neutral-500 underline hover:text-emerald-900">
              edit
            </button>
          </h1>
        )}
        <p className="mt-2 text-sm uppercase tracking-wider text-neutral-500">
          {app.library.length} games · {myReviews.length} reviews · {joinedGroups.length} societies
        </p>
      </div>

      <SectionHeading>The Top Three</SectionHeading>
      {favorites.length === 0 ? (
        <p className="italic text-neutral-500">
          No favorites declared. Open a game page and add it to your Top 3.
        </p>
      ) : (
        <div className="flex flex-wrap gap-8">
          {favorites.map((g, i) => (
            <Link key={g.id} to={`/game/${g.id}`} className="group w-40">
              <p className="mb-1 font-serif text-3xl font-black text-neutral-300">
                {['I', 'II', 'III'][i]}
              </p>
              <Cover game={g} className="aspect-[3/4] group-hover:border-emerald-900" />
            </Link>
          ))}
        </div>
      )}

      <SectionHeading>Connected accounts</SectionHeading>
      <ConnectionsPanel />

      {recs.length > 0 && (
        <>
          <SectionHeading>Suggested reading… er, playing</SectionHeading>
          <ul className="divide-y divide-neutral-300 border-y border-neutral-300">
            {recs.map((r) => (
              <li key={r.game.id} className="flex items-baseline gap-4 py-3">
                <Link to={`/game/${r.game.id}`} className="font-serif text-lg font-semibold text-neutral-900 hover:underline">
                  {r.game.title}
                </Link>
                <span className="text-xs uppercase tracking-wider text-neutral-500">
                  {r.matchedTags.slice(0, 3).join(' · ')}
                </span>
                <span className="ml-auto text-sm font-bold text-emerald-900">{r.score}%</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <SectionHeading>Your published reviews</SectionHeading>
      {myReviews.length === 0 ? (
        <p className="italic text-neutral-500">Nothing published yet.</p>
      ) : (
        <ul className="divide-y divide-neutral-300">
          {myReviews.map((r) => (
            <li key={r.id} className="py-4">
              <p>
                <Link to={`/game/${r.gameId}`} className="font-serif text-lg font-bold text-neutral-900 hover:underline">
                  {getGame(r.gameId)?.title}
                </Link>
                <span className="ml-3 font-bold text-emerald-900">{r.rating}/10</span>
              </p>
              <p className="mt-1 leading-relaxed text-neutral-700">{r.text}</p>
              <p className="mt-1 text-sm text-neutral-500">{r.date} · {r.likes} commendations</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface SteamApiGame {
  appid: number;
  name: string;
  hours: number;
}

/** Same linking/import logic as the shared Connections component, restyled for Atlas. */
function ConnectionsPanel() {
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
        setMessage({
          kind: 'err',
          text:
            data.error === 'steam_api_key_missing'
              ? 'The server has no Steam API key configured, so a real import is unavailable. Use the sample import below, or set STEAM_API_KEY on the server.'
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
            : `Imported ${matched.length} of ${games.length} Steam games (${games.length - matched.length} not yet in our catalog).`,
      });
    } catch {
      setMessage({ kind: 'err', text: 'Could not reach the backend. Start it with "npm run dev" in the server/ folder.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {message && (
        <p className={`mb-4 border-l-2 pl-3 text-sm font-semibold ${message.kind === 'ok' ? 'border-emerald-900 text-emerald-900' : 'border-red-900 text-red-900'}`}>
          {message.text}
        </p>
      )}
      <div className="grid gap-px border border-neutral-300 bg-neutral-300 sm:grid-cols-2">
        {/* Steam */}
        <div className="bg-white p-5">
          <h3 className="font-serif text-lg font-bold text-neutral-900">Steam</h3>
          {steam ? (
            <>
              <p className="mt-1 text-sm text-neutral-600">
                {steam.personaName ? `${steam.personaName} · ` : ''}ID {steam.steamId} · linked {steam.linkedAt}
                {steam.lastImport && ` · last import: ${steam.lastImport.matched} games (${steam.lastImport.date})`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Btn primary disabled={busy} onClick={importLibrary}>
                  {busy ? 'Importing…' : 'Import library'}
                </Btn>
                <Btn onClick={() => app.unlinkSteam()}>Unlink</Btn>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                Sign in through Steam to import your games and hours played.
              </p>
              <a
                href="/auth/steam"
                className="mt-3 inline-block bg-emerald-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Sign in through Steam
              </a>
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-neutral-500">Or link manually with a SteamID64</summary>
                <div className="mt-2 flex gap-2">
                  <input
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value.trim())}
                    placeholder="17-digit SteamID64"
                    className={`${inputCls} flex-1`}
                  />
                  <Btn
                    disabled={!/^\d{17}$/.test(manualId)}
                    onClick={() => {
                      app.linkSteam(manualId);
                      setManualId('');
                      setMessage({ kind: 'ok', text: 'Steam account linked.' });
                    }}
                  >
                    Link
                  </Btn>
                </div>
              </details>
            </>
          )}
        </div>

        {/* Ubisoft */}
        <div className="bg-white p-5">
          <h3 className="font-serif text-lg font-bold text-neutral-900">Ubisoft Connect</h3>
          {ubisoft ? (
            <>
              <p className="mt-1 text-sm text-neutral-600">{ubisoft.username} · linked {ubisoft.linkedAt}</p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                Ubisoft offers no public library API yet, so automatic import isn&rsquo;t available — your
                account will sync as soon as they open one up.
              </p>
              <div className="mt-3"><Btn onClick={() => app.unlinkUbisoft()}>Unlink</Btn></div>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">Link your Ubisoft Connect username.</p>
              <div className="mt-3 flex gap-2">
                <input
                  value={ubiName}
                  onChange={(e) => setUbiName(e.target.value)}
                  placeholder="Ubisoft username"
                  className={`${inputCls} flex-1`}
                />
                <Btn
                  disabled={!ubiName.trim()}
                  onClick={() => {
                    app.linkUbisoft(ubiName.trim());
                    setUbiName('');
                  }}
                >
                  Link
                </Btn>
              </div>
            </>
          )}
        </div>
      </div>

      {!app.steamImported && (
        <p className="mt-3 text-sm text-neutral-500">
          No backend or API key handy?{' '}
          <DemoImportLink /> — games land in <Link to="/library" className="text-emerald-900 underline">your ledger</Link> with hours played.
        </p>
      )}
    </div>
  );
}

function DemoImportLink() {
  const app = useApp();
  const [importing, setImporting] = useState(false);
  return (
    <button
      disabled={importing}
      onClick={() => {
        setImporting(true);
        setTimeout(() => {
          app.importSteam();
          setImporting(false);
        }, 800);
      }}
      className="font-semibold text-emerald-900 underline hover:text-emerald-800 disabled:opacity-50"
    >
      {importing ? 'Importing sample…' : 'Import a sample library'}
    </button>
  );
}
