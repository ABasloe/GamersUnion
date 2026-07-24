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

/**
 * "Watch an ad to support us." Design-neutral (self-contained dark panel) so
 * it can render inside any of the design layouts. Talks to the server's ad
 * endpoints; house ads today, a real ad network later without UI changes.
 */
export function Support() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [stats, setStats] = useState<AdStats | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'playing' | 'done' | 'error'>('idle');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/ads/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((s: AdStats | null) => s && setStats(s))
      .catch(() => {});
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const sendEvent = useCallback(async (adId: string, type: 'impression' | 'complete') => {
    try {
      const res = await fetch(`/api/ads/${adId}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = (await res.json()) as { stats: AdStats };
        setStats(data.stats);
      }
    } catch {
      // tracking is best-effort; never break playback over it
    }
  }, []);

  const watchAd = useCallback(async () => {
    setPhase('loading');
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

  return (
    <div className="mx-auto my-8 w-full max-w-2xl rounded-sm bg-zinc-900 p-8 text-zinc-100 ring-1 ring-zinc-700">
      <p className="text-xs uppercase tracking-widest text-zinc-400">Support GamersUnion</p>
      <h1 className="mt-2 font-serif text-3xl text-zinc-50">Watch an ad, keep the servers warm</h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-zinc-300">
        GamersUnion is free and has no paywalls. If you want to chip in without spending anything,
        watching a short ad helps. Right now these are house ads while we get the site in front of
        real sponsors — every completed view is still counted, so you're helping us prove there's an
        audience worth sponsoring.
      </p>

      <div className="mt-6 min-h-44 rounded-sm bg-zinc-950 p-6 ring-1 ring-zinc-800">
        {phase === 'idle' && (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-6">
            <button
              onClick={watchAd}
              className="rounded-sm bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500"
            >
              ▶ Watch an ad
            </button>
            <p className="text-xs text-zinc-500">10–15 seconds. No sound, no tracking cookies.</p>
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
                <p className="text-xs text-emerald-400">✓ counted</p>
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
                <p className="text-sm text-zinc-300">Thank you — that view was logged for our sponsor pitch.</p>
                <button
                  onClick={watchAd}
                  className="shrink-0 rounded-sm px-4 py-2 text-sm ring-1 ring-zinc-600 hover:bg-zinc-800"
                >
                  Watch another
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-10 gap-y-3 border-t border-zinc-800 pt-5 text-sm">
        <div>
          <p className="text-2xl font-semibold tabular-nums text-zinc-50">{stats ? stats.completes : '—'}</p>
          <p className="text-xs text-zinc-400">ads watched by the community</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums text-zinc-50">
            {stats ? `$${stats.estimatedSupportUsd.toFixed(2)}` : '—'}
          </p>
          <p className="text-xs text-zinc-400">estimated support (placeholder rate until a real ad network signs on)</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums text-zinc-50">{stats ? stats.impressions : '—'}</p>
          <p className="text-xs text-zinc-400">total ad starts</p>
        </div>
      </div>
    </div>
  );
}
