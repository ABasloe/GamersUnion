import { Link } from 'react-router-dom';
import { GAMES } from '../../data/games';
import { NEWS } from '../../data/seed';
import { useApp } from '../../store/AppContext';
import { getRecommendations } from '../../utils/similarity';
import { SectionHeading, ShelfCard, Tag } from './ui';

export function Home() {
  const { library, favorites, reviews } = useApp();
  const trending = [...GAMES].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 10);
  const topRated = [...GAMES].sort((a, b) => b.communityRating - a.communityRating).slice(0, 10);
  const recs = getRecommendations(library, favorites).slice(0, 5);
  const [lead, ...restNews] = NEWS;
  const recentReviews = reviews.slice(0, 4);

  return (
    <div>
      {/* Lead story + news column */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <article className="border-b border-neutral-300 pb-8 lg:border-b-0 lg:border-r lg:pr-10 lg:pb-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-900/80">{lead.tag}</p>
          <h1 className="mt-2 font-serif text-4xl font-black leading-tight text-neutral-900">{lead.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-700 first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-emerald-900">
            {lead.blurb}
          </p>
          <p className="mt-3 text-xs uppercase tracking-wider text-neutral-500">{lead.date}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/browse"
              className="bg-emerald-900 px-5 py-2 text-sm font-semibold tracking-wide text-white hover:bg-emerald-800"
            >
              Browse the catalog
            </Link>
            <Link
              to="/library"
              className="border border-neutral-400 bg-white px-5 py-2 text-sm font-semibold tracking-wide text-neutral-800 hover:border-emerald-900 hover:text-emerald-900"
            >
              My library ({library.length})
            </Link>
          </div>
        </article>

        <aside>
          <h2 className="border-b-2 border-neutral-900 pb-1 font-serif text-lg font-bold text-neutral-900">
            In brief
          </h2>
          <ul className="divide-y divide-neutral-300">
            {restNews.map((n) => (
              <li key={n.id} className="py-3">
                <div className="mb-1"><Tag>{n.tag}</Tag></div>
                <p className="font-serif font-semibold leading-snug text-neutral-900">{n.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{n.blurb}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <SectionHeading>Trending this week</SectionHeading>
      <div className="flex gap-5 overflow-x-auto pb-3">
        {trending.map((g) => <ShelfCard key={g.id} game={g} />)}
      </div>

      {recs.length > 0 && (
        <>
          <SectionHeading>Recommended for you</SectionHeading>
          <p className="-mt-2 mb-4 text-sm italic text-neutral-500">
            Drawn from the tags of games you&rsquo;ve rated and favorited.
          </p>
          <ul className="divide-y divide-neutral-300 border-y border-neutral-300">
            {recs.map((r, i) => (
              <li key={r.game.id} className="flex items-baseline gap-4 py-3">
                <span className="font-serif text-2xl font-bold text-neutral-300">{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <Link to={`/game/${r.game.id}`} className="font-serif text-lg font-semibold text-neutral-900 hover:underline">
                    {r.game.title}
                  </Link>
                  <span className="ml-3 text-xs uppercase tracking-wider text-neutral-500">
                    {r.matchedTags.slice(0, 3).join(' · ')}
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-900">{r.score}% match</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <SectionHeading>Highest rated of all time</SectionHeading>
      <div className="flex gap-5 overflow-x-auto pb-3">
        {topRated.map((g) => <ShelfCard key={g.id} game={g} />)}
      </div>

      <SectionHeading>Fresh reviews</SectionHeading>
      <div className="grid gap-6 sm:grid-cols-2">
        {recentReviews.map((r) => {
          const game = GAMES.find((g) => g.id === r.gameId);
          return (
            <blockquote key={r.id} className="border-l-2 border-emerald-900 pl-4">
              <p className="font-serif text-lg italic leading-relaxed text-neutral-800">&ldquo;{r.text}&rdquo;</p>
              <footer className="mt-2 text-sm text-neutral-500">
                — {r.author} on{' '}
                <Link to={`/game/${r.gameId}`} className="font-semibold text-emerald-900 hover:underline">
                  {game?.title}
                </Link>{' '}
                ({r.rating}/10)
              </footer>
            </blockquote>
          );
        })}
      </div>
    </div>
  );
}
