import { useCallback, useEffect, useRef, useState } from 'react';
import { Btn, DISPLAY, EMBER, GROUND, LINE, MONO, MOSS, MUTED, NOTCH, SURFACE, TEXT } from '../designs/union/ui';

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

function Card({ children, edge }: { children: React.ReactNode; edge?: string }) {
  return (
    <div
      className="border p-7"
      style={{ clipPath: NOTCH, background: SURFACE, borderColor: LINE, borderLeft: edge ? `3px solid ${edge}` : undefined }}
    >
      {children}
    </div>
  );
}

/**
 * The Support hub: watch ads to earn raffle tickets (Steam-key giveaways)
 * and points (gift cards, badges). Styled entirely through the Union theme
 * variables so it follows every theme, light or dark.
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
    <div className="mx-auto my-8 flex w-full max-w-2xl flex-col gap-5 px-4" style={{ color: TEXT }}>
      <Card edge={MOSS}>
        <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: MUTED, ...DISPLAY }}>support GamersUnion</p>
        <h1 className="mt-2 text-2xl font-semibold" style={DISPLAY}>Watch an ad, earn your way into the raffles</h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed" style={{ color: MUTED }}>
          GamersUnion is free and has no paywalls. Every completed ad earns you{' '}
          {config?.earning.ticketsPerAd ?? 1} raffle ticket and {config?.earning.pointsPerAd ?? 10} points.
          Tickets enter Steam-key giveaways funded by ad revenue; points redeem gift cards and supporter
          badges. These are house ads while we court real sponsors — everything you earn now is real and
          carries over.
        </p>

        {/* Wallet */}
        <div className="mt-5 flex flex-wrap gap-x-10 gap-y-3 border-y py-4" style={{ borderColor: LINE }}>
          <div>
            <p className="text-2xl font-semibold" style={{ color: MOSS, ...MONO }}>{rewards ? rewards.tickets : '—'}</p>
            <p className="text-xs" style={{ color: MUTED }}>raffle tickets</p>
          </div>
          <div>
            <p className="text-2xl font-semibold" style={{ color: MOSS, ...MONO }}>{rewards ? rewards.points : '—'}</p>
            <p className="text-xs" style={{ color: MUTED }}>points</p>
          </div>
          {rewards && rewards.badges.length > 0 && (
            <div>
              <p className="flex flex-wrap gap-1.5">
                {rewards.badges.map((b) => (
                  <span
                    key={b}
                    className="border px-2 py-0.5 text-xs"
                    style={{ borderColor: MOSS, color: MOSS, clipPath: 'polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)' }}
                  >
                    {badgeTitle(b)}
                  </span>
                ))}
              </p>
              <p className="mt-1 text-xs" style={{ color: MUTED }}>your badges</p>
            </div>
          )}
        </div>

        {notice && <p className="mt-3 text-sm" style={{ color: EMBER }}>{notice}</p>}

        {/* Ad player */}
        <div className="mt-5 min-h-44 border p-6" style={{ background: GROUND, borderColor: LINE }}>
          {phase === 'idle' && (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-6">
              <Btn primary onClick={watchAd}>watch an ad</Btn>
              <p className="text-xs" style={{ color: 'var(--gu-faint)' }}>10-15 seconds. No sound, no tracking cookies.</p>
            </div>
          )}
          {phase === 'loading' && <p className="py-10 text-center" style={{ color: MUTED }}>Fetching an ad…</p>}
          {phase === 'error' && (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--gu-danger)' }}>
                Couldn't reach the ad server — is the backend running? (npm run dev in server/)
              </p>
              <div className="mt-3 flex justify-center">
                <Btn onClick={watchAd}>try again</Btn>
              </div>
            </div>
          )}
          {(phase === 'playing' || phase === 'done') && ad && (
            <div aria-live="polite">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: EMBER, ...DISPLAY }}>ad · {ad.sponsor}</p>
                {phase === 'playing' ? (
                  <p className="text-xs" style={{ color: MUTED, ...MONO }}>{secondsLeft}s</p>
                ) : (
                  <p className="text-xs" style={{ color: MOSS }}>ticket + points earned</p>
                )}
              </div>
              <h2 className="mt-3 text-xl font-semibold" style={DISPLAY}>{ad.title}</h2>
              <p className="mt-2 text-sm" style={{ color: MUTED }}>{ad.body}</p>
              <div className="mt-5 h-[3px] w-full overflow-hidden" style={{ background: LINE }}>
                <div
                  className="h-full motion-safe:transition-all motion-safe:duration-1000 motion-safe:ease-linear"
                  style={{ width: `${ad.durationSec ? ((ad.durationSec - secondsLeft) / ad.durationSec) * 100 : 0}%`, background: MOSS }}
                />
              </div>
              {phase === 'done' && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm" style={{ color: TEXT }}>
                    +{config?.earning.ticketsPerAd ?? 1} ticket, +{config?.earning.pointsPerAd ?? 10} points. Thank you.
                  </p>
                  <Btn onClick={watchAd}>watch another</Btn>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Raffles */}
      <Card edge={EMBER}>
        <h2 className="text-xl font-semibold" style={DISPLAY}>Steam key raffles</h2>
        <p className="mt-2 max-w-prose text-sm" style={{ color: MUTED }}>
          Spend tickets for entries. More entries, better odds. Winners are drawn after the end date and
          announced here; keys are bought from ad revenue.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {(config?.giveaways ?? []).map((g) => (
            <div key={g.id} className="border p-5" style={{ background: GROUND, borderColor: LINE }}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold" style={DISPLAY}>{g.title}</h3>
                <p className="text-xs" style={{ color: MUTED, ...MONO }}>ends {g.endsAt}</p>
              </div>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>{g.prize}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Btn
                  primary
                  disabled={!rewards || rewards.tickets < 1}
                  onClick={() => post(`/api/rewards/giveaways/${g.id}/enter`, { tickets: 1 }, `Entered ${g.title}.`)}
                >
                  enter with 1 ticket
                </Btn>
                {rewards && (rewards.entries[g.id] ?? 0) > 0 && (
                  <p className="text-xs" style={{ color: MOSS, ...MONO }}>your entries: {rewards.entries[g.id]}</p>
                )}
              </div>
            </div>
          ))}
          {!config && <p className="text-sm" style={{ color: MUTED }}>Raffles load from the server — start the backend to see them.</p>}
        </div>
      </Card>

      {/* Rewards catalog */}
      <Card edge={MOSS}>
        <h2 className="text-xl font-semibold" style={DISPLAY}>Redeem points</h2>
        <p className="mt-2 max-w-prose text-sm" style={{ color: MUTED }}>
          Badges are granted instantly. Gift cards are queued and fulfilled manually while we're small —
          you'll see the redemption tracked below.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(config?.catalog ?? []).map((item) => {
            const owned = item.kind === 'badge' && rewards?.badges.includes(item.id);
            return (
              <div key={item.id} className="flex flex-col border p-5" style={{ background: GROUND, borderColor: LINE }}>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold" style={DISPLAY}>{item.title}</h3>
                  <p className="text-xs" style={{ color: MUTED, ...MONO }}>{item.cost} pts</p>
                </div>
                <p className="mt-1 flex-1 text-sm" style={{ color: MUTED }}>{item.description}</p>
                <div className="mt-3">
                  <Btn
                    disabled={owned || !rewards || rewards.points < item.cost}
                    onClick={() => post('/api/rewards/redeem', { itemId: item.id }, `Redeemed: ${item.title}.`)}
                  >
                    {owned ? 'owned' : 'redeem'}
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
        {rewards && rewards.redemptions.length > 0 && (
          <div className="mt-5 border-t pt-4" style={{ borderColor: LINE }}>
            <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: MUTED, ...DISPLAY }}>your redemptions</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {rewards.redemptions.map((r, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span style={{ color: TEXT }}>{badgeTitle(r.itemId)}</span>
                  <span style={{ color: r.status === 'pending' ? EMBER : MOSS }}>
                    {r.status === 'pending' ? 'queued for fulfillment' : 'granted'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Community stats */}
      <div className="flex flex-wrap gap-x-10 gap-y-3 border p-6" style={{ clipPath: NOTCH, background: SURFACE, borderColor: LINE }}>
        <div>
          <p className="text-2xl font-semibold" style={MONO}>{stats ? stats.completes : '—'}</p>
          <p className="text-xs" style={{ color: MUTED }}>ads watched by the community</p>
        </div>
        <div>
          <p className="text-2xl font-semibold" style={MONO}>{stats ? `$${stats.estimatedSupportUsd.toFixed(2)}` : '—'}</p>
          <p className="text-xs" style={{ color: MUTED }}>estimated raffle fund (placeholder rate until a real network signs on)</p>
        </div>
        <div>
          <p className="text-2xl font-semibold" style={MONO}>{stats ? stats.impressions : '—'}</p>
          <p className="text-xs" style={{ color: MUTED }}>total ad starts</p>
        </div>
      </div>
    </div>
  );
}
