import { useMemo, useState } from 'react';
import { GAMES } from '../../data/games';
import { GameTile, Panel, PanelTitle, inputClass } from './ui';

type SortKey = 'trending' | 'rating' | 'title' | 'year';

export function Browse() {
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
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-white">Browse</h1>
      <Panel className="flex flex-wrap gap-2 p-3">
        <input
          type="search"
          placeholder="Search games…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${inputClass} min-w-44 flex-1`}
        />
        <select value={tag} onChange={(e) => setTag(e.target.value)} className={inputClass}>
          <option value="">All tags</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={inputClass}>
          <option value="trending">Trending</option>
          <option value="rating">Top Rated</option>
          <option value="title">A–Z</option>
          <option value="year">Newest</option>
        </select>
      </Panel>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {games.map((g) => <GameTile key={g.id} game={g} />)}
      </div>
      {games.length === 0 && (
        <Panel className="p-6 text-center text-sm text-slate-400">
          <PanelTitle>No signal</PanelTitle>
          <p className="mt-2">No games match your search.</p>
        </Panel>
      )}
    </div>
  );
}
