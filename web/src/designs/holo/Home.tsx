import { Link } from 'react-router-dom';
import { GAMES } from '../../data/games';
import { NEWS } from '../../data/seed';
import { useApp } from '../../store/AppContext';
import { getRecommendations } from '../../utils/similarity';
import { GradientText, Panel, PanelTitle, Tag } from './ui';

export function Home() {
  const { library, favorites, reviews } = useApp();
  const trending = [...GAMES].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 6);
  const maxTrend = trending[0]?.trendingScore ?? 100;
  const recs = getRecommendations(library, favorites).slice(0, 4);
  const totalHours = library.reduce((s, e) => s + (e.hoursPlayed ?? 0), 0);
  const playing = library.filter((e) => e.status === 'playing').length;
  const recentReviews = reviews.slice(0, 3);

  const stats = [
    { label: 'Games tracked', value: library.length },
    { label: 'Hours logged', value: totalHours.toLocaleString() },
    { label: 'Playing now', value: playing },
    { label: 'Favorites', value: favorites.length },
  ];

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Mission <GradientText>Control</GradientText>
          </h1>
          <p className="text-sm text-slate-400">Track, rate, and discuss every game you play.</p>
        </div>
        <Link
          to="/browse"
          className="bg-gradient-to-r from-violet-400 to-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 hover:from-violet-300 hover:to-cyan-200"
        >
          Browse catalog →
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Panel key={s.label} className="p-4">
            <div className="text-2xl font-extrabold text-white">{s.value}</div>
            <div className="text-xs uppercase tracking-widest text-slate-500">{s.label}</div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel className="p-5 lg:col-span-3">
          <PanelTitle>Trending now</PanelTitle>
          <ol className="mt-4 space-y-3">
            {trending.map((g, i) => (
              <li key={g.id}>
                <Link to={`/game/${g.id}`} className="group flex items-center gap-3">
                  <span className="w-6 text-right font-mono text-sm font-bold text-slate-500">{i + 1}</span>
                  <span className="text-lg">{g.cover.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-100 group-hover:text-cyan-300">
                        {g.title}
                      </span>
                      <span className="text-xs font-bold text-cyan-300">{g.communityRating.toFixed(1)}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-400"
                        style={{ width: `${(g.trendingScore / maxTrend) * 100}%` }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel className="p-5 lg:col-span-2">
          <PanelTitle>News feed</PanelTitle>
          <div className="mt-4 space-y-4">
            {NEWS.slice(0, 4).map((n) => (
              <article key={n.id} className="border-l-2 border-violet-500/50 pl-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500">
                  <Tag>{n.tag}</Tag>
                  {n.date}
                </div>
                <h3 className="mt-1 text-sm font-semibold text-slate-100">{n.title}</h3>
                <p className="text-xs text-slate-400">{n.blurb}</p>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      {recs.length > 0 && (
        <Panel className="p-5">
          <PanelTitle>Calibrated for you</PanelTitle>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
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
        <PanelTitle>Fresh reviews</PanelTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {recentReviews.map((r) => {
            const game = GAMES.find((g) => g.id === r.gameId);
            return (
              <div key={r.id} className="bg-white/5 p-3 ring-1 ring-white/10">
                <div className="flex items-center justify-between">
                  <Link to={`/game/${r.gameId}`} className="text-sm font-semibold text-slate-100 hover:text-cyan-300">
                    {game?.title}
                  </Link>
                  <span className="text-xs font-bold text-violet-300">{r.rating}/10</span>
                </div>
                <p className="mt-1 line-clamp-3 text-xs text-slate-400">"{r.text}"</p>
                <div className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">
                  {r.author} · 👍 {r.likes}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
