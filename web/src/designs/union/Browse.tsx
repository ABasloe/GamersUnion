import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GAMES } from '../../data/games';
import { useApp } from '../../store/AppContext';
import { STATUS_LABELS } from '../../components/statusMeta';
import { Chip, Cover, DISPLAY, MONO, MOSS, MUTED, TEXT, focusRing, inputCls, selectCls } from './ui';

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
    const sorters: Record<SortKey, (a: typeof GAMES[0], b: typeof GAMES[0]) => number> = {
      trending: (a, b) => b.trendingScore - a.trendingScore,
      rating: (a, b) => b.communityRating - a.communityRating,
      title: (a, b) => a.title.localeCompare(b.title),
      year: (a, b) => b.year - a.year,
    };
    return [...list].sort(sorters[sort]);
  }, [query, tag, sort]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-2xl font-semibold" style={DISPLAY}>Browse</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="search"
          className={`${inputCls} min-w-44 flex-1`}
          placeholder="search games"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className={selectCls} value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">all tags</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className={selectCls} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="trending">trending</option>
          <option value="rating">top rated</option>
          <option value="title">a to z</option>
          <option value="year">newest</option>
        </select>
      </div>

      <div className="mt-6 grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        {games.map((g) => {
          const entry = library.find((e) => e.gameId === g.id);
          return (
            <Link key={g.id} to={`/game/${g.id}`} className={`group block ${focusRing}`}>
              <Cover game={g} className="aspect-[3/4] w-full motion-safe:transition-transform motion-safe:group-hover:-translate-y-1" />
              <p className="mt-2 text-sm font-semibold" style={{ ...DISPLAY, color: TEXT }}>{g.title}</p>
              <p className="text-xs" style={{ color: MUTED, ...MONO }}>
                {g.year} · {g.communityRating.toFixed(1)}/10
              </p>
              {entry && <span className="mt-1 inline-block"><Chip color={MOSS}>{STATUS_LABELS[entry.status].toLowerCase()}</Chip></span>}
            </Link>
          );
        })}
      </div>
      {games.length === 0 && <p className="mt-8 text-sm" style={{ color: MUTED }}>No games match. Clear the search or pick another tag.</p>}
    </div>
  );
}
