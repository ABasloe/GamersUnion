import { Link } from 'react-router-dom';
import type { Game, PlayStatus } from '../../types';
import { useApp } from '../../store/AppContext';
import { STATUS_LABELS } from '../../components/statusMeta';

/** Local cover plate: hairline-bordered, subtle gradient from the game's palette. */
export function Cover({ game, className = '' }: { game: Game; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 border border-neutral-300 p-3 text-center ${className}`}
      style={{ background: `linear-gradient(165deg, ${game.cover.from}22, ${game.cover.to}33)` }}
      aria-label={`${game.title} cover`}
    >
      <span className="text-3xl">{game.cover.emoji}</span>
      <span className="font-serif text-sm font-semibold leading-tight text-neutral-900">{game.title}</span>
    </div>
  );
}

export function ShelfCard({ game }: { game: Game }) {
  const { library } = useApp();
  const entry = library.find((e) => e.gameId === game.id);
  return (
    <Link to={`/game/${game.id}`} className="group w-36 shrink-0">
      <Cover game={game} className="aspect-[3/4] transition-colors group-hover:border-emerald-900" />
      <p className="mt-1.5 font-serif text-sm font-semibold leading-snug text-neutral-900 group-hover:underline">
        {game.title}
      </p>
      <p className="text-xs text-neutral-500">
        {game.year} · {game.communityRating.toFixed(1)}/10
      </p>
      {entry && <StatusBadge status={entry.status} />}
    </Link>
  );
}

export function StatusBadge({ status }: { status: PlayStatus }) {
  const tones: Record<PlayStatus, string> = {
    playing: 'text-emerald-800 border-emerald-800',
    played: 'text-neutral-700 border-neutral-400',
    want: 'text-orange-900/70 border-orange-900/40',
    'on-hold': 'text-neutral-500 border-neutral-300',
    dropped: 'text-red-900/70 border-red-900/40',
  };
  return (
    <span className={`mt-1 inline-block border px-1.5 py-px text-[10px] uppercase tracking-wider ${tones[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 mb-4 border-b border-neutral-300 pb-2 font-serif text-2xl font-bold text-neutral-900">
      {children}
    </h2>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-neutral-300 bg-white px-2 py-px text-[11px] uppercase tracking-wide text-neutral-600">
      {children}
    </span>
  );
}

export function Btn({
  primary,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button
      {...props}
      className={`px-4 py-1.5 text-sm font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        primary
          ? 'bg-emerald-900 text-white hover:bg-emerald-800'
          : 'border border-neutral-400 bg-white text-neutral-800 hover:border-emerald-900 hover:text-emerald-900'
      } ${className}`}
    />
  );
}

/** 1..10 rating control rendered as a row of numbered squares. */
export function RatingRow({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onChange(value === n ? null : n)}
          aria-label={`Rate ${n} out of 10`}
          className={`h-7 w-7 border text-xs font-semibold transition-colors ${
            value != null && n <= value
              ? 'border-emerald-900 bg-emerald-900 text-white'
              : 'border-neutral-300 bg-white text-neutral-500 hover:border-emerald-900'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export const inputCls =
  'border border-neutral-400 bg-white px-3 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-900 focus:outline-none';
