import { useCallback, useEffect, useRef, useState } from 'react';

interface Ad {
  id: string;
  sponsor: string;
  title: string;
  body: string;
  durationSec: number;
}

interface AdStats {
  impressions: number;
  completes: number;
  estimatedSupportUsd: number;
}

interface Giveaway {
  id: string;
  title: string;
  prize: string;
  endsAt: string;
}

interface CatalogItem {
  id: string;
  kind: 'badge' | 'giftcard';
  title: string;
  description: string;
  cost: number;
}

interface RewardsConfig {
  giveaways: Giveaway[];
  catalog: CatalogItem[];
  earning: { ticketsPerAd: number; pointsPerAd: number };
}

interface RewardsState {
  points: number;
  tickets: number;
  badges: string[];
  entries: Record<string, number>;
  redemptions: { itemId: string; at: string; status: 'granted' | 'pending' }[];
}

/** Anonymous supporter id so rewards persist without an account. */
function supporterId(): string {
  const KEY = 'gu-supporter-id';
  let id = localStorage.getItem(KEY);
  if (!id || !/^[a-z0-9-]{8,64}$/.test(id)) {
    id = `sup-${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * The Support hub: watch ads to earn raffle tickets (Steam-key giveaways)
 * and points (gift cards, badges). Deliberately self-contained — nothing
 * here leaks into the rest of the app.
 */
export function Support() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [stats, setStats] = useState<AdStats | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'playing' | 'done' | 'error'>('idle');
  const [config, setConfig] = useState<RewardsConfig | null>(null);
  const [rewards, setRewards] = useState<RewardsState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sid = useRef(supporterId());

  useEffect(() => {
    fetch('/api/ads/stats').then((r) => (r.ok ? r.json() : null)).then((s: AdStats | null) => s && setStats(s)).catch(() => {});
    fetch('/api/rewards/config').then((r) => (r.ok ? r.json() : null)).then((c: RewardsConfig | null) => c && setConfig(c)).catch(() => {});
    fetch(`/api/rewards/state/${sid.current}`).then((r) => (r.ok ? r.json() : null)).then((s: RewardsState | null) => s && setRewards(s)).catch(() => {});
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const sendEvent = useCallback(async (adId: string, type: 'impression' | 'complete') => {
    try {
      const res = await fetch(`/api/ads/${adId}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, supporterId: sid.current }),
      });
      if (res.ok) {
        const data = (await res.json()) as { stats: AdStats };
        setStats(data.stats);
        if (type === 'complete') {
          const state = await fetch(`/api/rewards/state/${sid.current}`);
          if (state.ok) setRewards((await state.json()) as RewardsState);
        }
      }
    } catch {
      // tracking is best-effort; never break playback over it
    }
  }, []);

  const watchAd = useCallback(async () => {
    setPhase('loading');
    setNotice(null);
    try {
      const res = await fetch('/api/ads/next');
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { ad: Ad; stats: AdStats };
      setAd(data.ad);
      setStats(data.stats);
      setSecondsLeft(data.ad.durationSec);
      setPhase('playing');
      void sendEvent(data.ad.id, 'impression');
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setPhase('done');
            void sendEvent(data.ad.id, 'complete');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch {
      setPhase('error');
    }
  }, [sendEvent]);

  const post = useCallback(async (url: string, body: object, okNotice: string) => {
    setNotice(null);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, supporterId: sid.current }),
      });
      const data = (await res.json()) as RewardsState & { message?: string };
      if (!res.ok) {
        setNotice(data.message ?? 'That did not work — try again.');
        return;
      }
      setRewards(data);
      setNotice(okNotice);
    } catch {
      setNotice('Could not reach the server — is the backend running?');
    }
  }, []);

  const badgeTitle = (id: string) => config?.catalog.find((c) => c.id === id)?.title ?? id;

  return (
    <div className="mx-auto my-8 flex w-full max-w-2xl flex-col gap-6 px-4">
      <div className="rounded-sm bg-zinc-900 p-8 text-zinc-100 ring-1 ring-zinc-700">
        <p className="text-xs uppercase tracking-widest text-zinc-400">Support GamersUnion</p>
        <h1 className="mt-2 font-serif text-3xl text-zinc-50">Watch an ad, earn your way into the raffles</h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-zinc-300">
          Every completed ad earns you {config?.earning.ticketsPerAd ?? 1} raffle ticket and{' '}
          {config?.earning.pointsPerAd ?? 10} points. Tickets enter Steam-key giveaways we fund from ad
          revenue; points redeem gift cards and supporter badges. These are house ads while we court
          real sponsors, but everything you earn now is real and carries over.
        </p>

        {/* Wallet */}
        <div className="mt-5 flex flex-wrap gap-x-10 gap-y-3 border-y border-zinc-800 py-4">
          <div>
            <p className="text-2xl font-semibold tabular-nums text-emerald-400">{rewards ? rewards.tickets : '—'}</p>
            <p className="text-xs text-zinc-400">raffle tickets</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums text-emerald-400">{rewards ? rewards.points : '—'}</p>
            <p className="text-xs text-zinc-400">points</p>
          </div>
          {rewards && rewards.badges.length > 0 && (
            <div>
              <p className="flex flex-wrap gap-1.5">
                {rewards.badges.map((b) => (
                  <span key={b} className="rounded-sm bg-emerald-950 px-2 py-0.5 text-xs text-emerald-300 ring-1 ring-emerald-800">
                    {badgeTitle(b)}
                  </span>
                ))}
              </p>
              <p className="mt-1 text-xs text-zinc-400">your badges</p>
            </div>
          )}
        </div>

        {notice && <p className="mt-3 text-sm text-amber-300">{notice}</p>}

        {/* Ad player */}
        <div className="mt-5 min-h-44 rounded-sm bg-zinc-950 p-6 ring-1 ring-zinc-800">
          {phase === 'idle' && (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-6">
              <button
                onClick={watchAd}
                className="rounded-sm bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500"
              >
                Watch an ad
              </button>
              <p className="text-xs text-zinc-500">10-15 seconds. No sound, no tracking cookies.</p>
            </div>
          )}
          {phase === 'loading' && <p className="py-10 text-center text-zinc-400">Fetching an ad…</p>}
          {phase === 'error' && (
            <div className="py-8 text-center">
              <p className="text-sm text-rose-300">
                Couldn't reach the ad server — is the backend running? (npm run dev in server/)
              </p>
              <button onClick={watchAd} className="mt-3 rounded-sm px-4 py-2 text-sm ring-1 ring-zinc-600 hover:bg-zinc-800">
                Try again
              </button>
            </div>
          )}
          {(phase === 'playing' || phase === 'done') && ad && (
            <div aria-live="polite">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-xs uppercase tracking-widest text-amber-400/90">Ad · {ad.sponsor}</p>
                {phase === 'playing' ? (
                  <p className="text-xs tabular-nums text-zinc-400">{secondsLeft}s</p>
                ) : (
                  <p className="text-xs text-emerald-400">ticket + points earned</p>
                )}
              </div>
              <h2 className="mt-3 text-xl font-semibold text-zinc-50">{ad.title}</h2>
              <p className="mt-2 text-sm text-zinc-300">{ad.body}</p>
              <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${ad.durationSec ? ((ad.durationSec - secondsLeft) / ad.durationSec) * 100 : 0}%` }}
                />
              </div>
              {phase === 'done' && (
                <div className="mt-5 flex items-center justify-between gap-4">
                  <p className="text-sm text-zinc-300">
                    +{config?.earning.ticketsPerAd ?? 1} ticket, +{config?.earning.pointsPerAd ?? 10} points. Thank you.
                  </p>
                  <button onClick={watchAd} className="shrink-0 rounded-sm px-4 py-2 text-sm ring-1 ring-zinc-600 hover:bg-zinc-800">
                    Watch another
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Raffles */}
      <div className="rounded-sm bg-zinc-900 p-8 text-zinc-100 ring-1 ring-zinc-700">
        <h2 className="font-serif text-2xl text-zinc-50">Steam key raffles</h2>
        <p className="mt-2 max-w-prose text-sm text-zinc-400">
          Spend tickets for entries. More entries, better odds. Winners are drawn after the end date
          and announced here; keys are bought from ad revenue.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {(config?.giveaways ?? []).map((g) => (
            <div key={g.id} className="rounded-sm bg-zinc-950 p-5 ring-1 ring-zinc-800">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-zinc-100">{g.title}</h3>
                <p className="text-xs tabular-nums text-zinc-500">ends {g.endsAt}</p>
              </div>
              <p className="mt-1 text-sm text-zinc-400">{g.prize}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => post(`/api/rewards/giveaways/${g.id}/enter`, { tickets: 1 }, `Entered ${g.title}.`)}
                  disabled={!rewards || rewards.tickets < 1}
                  className="rounded-sm bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Enter with 1 ticket
                </button>
                {rewards && (rewards.entries[g.id] ?? 0) > 0 && (
                  <p className="text-xs text-emerald-400">your entries: {rewards.entries[g.id]}</p>
                )}
              </div>
            </div>
          ))}
          {!config && <p className="text-sm text-zinc-500">Raffles load from the server — start the backend to see them.</p>}
        </div>
      </div>

      {/* Rewards catalog */}
      <div className="rounded-sm bg-zinc-900 p-8 text-zinc-100 ring-1 ring-zinc-700">
        <h2 className="font-serif text-2xl text-zinc-50">Redeem points</h2>
        <p className="mt-2 max-w-prose text-sm text-zinc-400">
          Badges are granted instantly. Gift cards are queued and fulfilled manually while we're small —
          you'll see the redemption tracked below.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(config?.catalog ?? []).map((item) => {
            const owned = item.kind === 'badge' && rewards?.badges.includes(item.id);
            return (
              <div key={item.id} className="flex flex-col rounded-sm bg-zinc-950 p-5 ring-1 ring-zinc-800">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-zinc-100">{item.title}</h3>
                  <p className="text-xs tabular-nums text-zinc-400">{item.cost} pts</p>
                </div>
                <p className="mt-1 flex-1 text-sm text-zinc-400">{item.description}</p>
                <button
                  onClick={() => post('/api/rewards/redeem', { itemId: item.id }, `Redeemed: ${item.title}.`)}
                  disabled={owned || !rewards || rewards.points < item.cost}
                  className="mt-3 self-start rounded-sm px-4 py-1.5 text-sm ring-1 ring-zinc-600 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {owned ? 'Owned' : 'Redeem'}
                </button>
              </div>
            );
          })}
        </div>
        {rewards && rewards.redemptions.length > 0 && (
          <div className="mt-5 border-t border-zinc-800 pt-4">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Your redemptions</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-zinc-300">
              {rewards.redemptions.map((r, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>{badgeTitle(r.itemId)}</span>
                  <span className={r.status === 'pending' ? 'text-amber-300' : 'text-emerald-400'}>
                    {r.status === 'pending' ? 'queued for fulfillment' : 'granted'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Community stats */}
      <div className="flex flex-wrap gap-x-10 gap-y-3 rounded-sm bg-zinc-900 p-6 text-zinc-100 ring-1 ring-zinc-700">
        <div>
          <p className="text-2xl font-semibold tabular-nums text-zinc-50">{stats ? stats.completes : '—'}</p>
          <p className="text-xs text-zinc-400">ads watched by the community</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums text-zinc-50">
            {stats ? `$${stats.estimatedSupportUsd.toFixed(2)}` : '—'}
          </p>
          <p className="text-xs text-zinc-400">estimated raffle fund (placeholder rate until a real network signs on)</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums text-zinc-50">{stats ? stats.impressions : '—'}</p>
          <p className="text-xs text-zinc-400">total ad starts</p>
        </div>
      </div>
    </div>
  );
}
