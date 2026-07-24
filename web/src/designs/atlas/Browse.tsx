import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GAMES } from '../../data/games';
import { useApp } from '../../store/AppContext';
import { Cover, StatusBadge, Tag, inputCls } from './ui';

type SortKey = 'trending' | 'rating' | 'title' | 'year';

export function Browse() {
  const { library } = useApp();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState<SortKey>('trending');

  const allTags = useMemo(() => [...new Set(GAMES.flatMap((g) => g.tags))].sort(), []);

  const games = useMemo(() => {
    let list = GAMES.filter((g) => g.title.toLowerCase().includes(query.toLowerCase()));
    if (tag) list = list.filter((g) => g.tags.includes(tag));
    const sorters: Record<SortKey, (a: (typeof GAMES)[0], b: (typeof GAMES)[0]) => number> = {
      trending: (a, b) => b.trendingScore - a.trendingScore,
      rating: (a, b) => b.communityRating - a.communityRating,
      title: (a, b) => a.title.localeCompare(b.title),
      year: (a, b) => b.year - a.year,
    };
    return [...list].sort(sorters[sort]);
  }, [query, tag, sort]);

  return (
    <div className="mt-10">
      <h1 className="font-serif text-4xl font-black text-neutral-900">The Catalog</h1>
      <p className="mt-1 italic text-neutral-500">Every title on our shelves.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-neutral-300 py-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles…"
          className={`${inputCls} min-w-52 flex-1`}
        />
        <select value={tag} onChange={(e) => setTag(e.target.value)} className={inputCls}>
          <option value="">All tags</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={inputCls}>
          <option value="trending">Trending</option>
          <option value="rating">Top rated</option>
          <option value="title">A–Z</option>
          <option value="year">Newest</option>
        </select>
      </div>

      {/* Index-style list rows, not a grid */}
      <ul className="divide-y divide-neutral-300">
        {games.map((g) => {
          const entry = library.find((e) => e.gameId === g.id);
          return (
            <li key={g.id}>
              <Link to={`/game/${g.id}`} className="group flex items-center gap-5 py-4">
                <Cover game={g} className="h-24 w-18 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-xl font-bold text-neutral-900 group-hover:underline">
                    {g.title} <span className="font-sans text-sm font-normal text-neutral-500">({g.year})</span>
                  </p>
                  <p className="text-sm text-neutral-600">{g.developer} · {g.platforms.join(', ')}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {g.tags.slice(0, 4).map((t) => <Tag key={t}>{t}</Tag>)}
                  </div>
                  {entry && <StatusBadge status={entry.status} />}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-serif text-2xl font-bold text-emerald-900">{g.communityRating.toFixed(1)}</p>
                  <p className="text-xs text-neutral-500">{g.ratingsCount.toLocaleString()} ratings</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {games.length === 0 && <p className="py-10 text-center italic text-neutral-500">Nothing matches your search.</p>}
    </div>
  );
}
