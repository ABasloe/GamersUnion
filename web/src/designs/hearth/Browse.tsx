import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GAMES } from '../../data/games';
import { useApp } from '../../store/AppContext';
import { Cover, SAGE, inputCls, selectCls } from './ui';

type SortKey = 'trending' | 'rating' | 'title' | 'year';

export function Browse() {
  const app = useApp();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState<SortKey>('trending');

  const allTags = useMemo(() => [...new Set(GAMES.flatMap((g) => g.tags))].sort(), []);
  const games = useMemo(() => {
    let list = GAMES.filter((g) => g.title.toLowerCase().includes(query.toLowerCase()));
    if (tag) list = list.filter((g) => g.tags.includes(tag));
    const by: Record<SortKey, (a: (typeof GAMES)[0], b: (typeof GAMES)[0]) => number> = {
      trending: (a, b) => b.trendingScore - a.trendingScore,
      rating: (a, b) => b.communityRating - a.communityRating,
      title: (a, b) => a.title.localeCompare(b.title),
      year: (a, b) => b.year - a.year,
    };
    return [...list].sort(by[sort]);
  }, [query, tag, sort]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="font-serif text-2xl italic text-stone-100">Browse the shelves</h1>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <input type="search" className={`${inputCls} min-w-52 flex-1`} placeholder="hunt by title…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className={selectCls} value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">every kind</option>
          {allTags.map((t) => <option key={t} value={t}>{t.toLowerCase()}</option>)}
        </select>
        <select className={selectCls} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="trending">what's hot</option>
          <option value="rating">best loved</option>
          <option value="title">a to z</option>
          <option value="year">newest</option>
        </select>
      </div>

      <div className="mt-6">
        {games.map((g, idx) => {
          const entry = app.library.find((e) => e.gameId === g.id);
          return (
            <Link
              key={g.id}
              to={`/game/${g.id}`}
              className="group flex items-center gap-4 border-b border-stone-800/70 py-3.5 hover:bg-stone-900/40"
              style={{ paddingLeft: `${(idx % 2) * 18}px` }}
            >
              <Cover game={g} className="h-16 w-12 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] text-stone-200 group-hover:underline underline-offset-4">{g.title}</p>
                <p className="text-xs text-stone-500">{g.year} · {g.tags.slice(0, 4).join(' · ').toLowerCase()}</p>
              </div>
              {entry && <span className="text-xs" style={{ color: SAGE }}>{entry.status}</span>}
              <span className="text-sm text-stone-500 tabular-nums">★ {g.communityRating.toFixed(1)}</span>
            </Link>
          );
        })}
        {games.length === 0 && <p className="py-8 text-sm text-stone-500">Nothing on this shelf.</p>}
      </div>
    </div>
  );
}
