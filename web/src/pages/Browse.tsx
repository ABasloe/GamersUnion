import { useMemo, useState } from 'react';
import { GAMES } from '../data/games';
import { GameCard } from '../components/GameCard';

type SortKey = 'trending' | 'rating' | 'title' | 'year';

export function Browse() {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string>('');
  const [sort, setSort] = useState<SortKey>('trending');

  const allTags = useMemo(() => [...new Set(GAMES.flatMap((g) => g.tags))].sort(), []);

  const games = useMemo(() => {
    let list = GAMES.filter((g) => g.title.toLowerCase().includes(query.toLowerCase()));
    if (tag) list = list.filter((g) => g.tags.includes(tag));
    const sorters: Record<SortKey, (a: typeof GAMES[0], b: typeof GAMES[0]) => number> = {
      trending: (a, b) => b.trendingScore - a.trendingScore,
      rating: (a, b) => b.communityRating - a.communityRating,
      title: (a, b) => a.title.localeCompare(b.title),
      year: (a, b) => b.year - a.year,
    };
    return [...list].sort(sorters[sort]);
  }, [query, tag, sort]);

  return (
    <div>
      <h1>Browse Games</h1>
      <div className="filter-bar">
        <input
          type="search"
          placeholder="Search games…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">All tags</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="trending">Trending</option>
          <option value="rating">Top Rated</option>
          <option value="title">A–Z</option>
          <option value="year">Newest</option>
        </select>
      </div>
      <div className="game-grid">
        {games.map((g) => <GameCard key={g.id} game={g} />)}
      </div>
      {games.length === 0 && <p className="muted">No games match your search.</p>}
    </div>
  );
}
