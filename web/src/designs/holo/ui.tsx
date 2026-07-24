import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Game } from '../../types';
import { useApp } from '../../store/AppContext';
import { STATUS_LABELS } from '../../components/statusMeta';

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/5 backdrop-blur ring-1 ring-white/10 ${className}`}>
      {children}
    </div>
  );
}

export function PanelTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 flex items-center gap-2">
      <span className="inline-block h-3 w-1 bg-gradient-to-b from-violet-500 to-cyan-400" />
      {children}
    </h2>
  );
}

export function GradientText({ children }: { children: ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
      {children}
    </span>
  );
}

export function Cover({ game, className = '' }: { game: Game; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 p-2 text-center ${className}`}
      style={{ background: `linear-gradient(160deg, ${game.cover.from}, ${game.cover.to})` }}
      aria-label={`${game.title} cover art`}
    >
      <span className="text-3xl drop-shadow">{game.cover.emoji}</span>
      <span className="text-xs font-bold text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
        {game.title}
      </span>
    </div>
  );
}

export const statusBadgeClass: Record<string, string> = {
  playing: 'bg-cyan-400/15 text-cyan-300 ring-cyan-400/30',
  played: 'bg-violet-400/15 text-violet-300 ring-violet-400/30',
  want: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30',
  'on-hold': 'bg-slate-400/15 text-slate-300 ring-slate-400/30',
  dropped: 'bg-rose-400/15 text-rose-300 ring-rose-400/30',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${statusBadgeClass[status] ?? ''}`}
    >
      {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
    </span>
  );
}

export function GameTile({ game }: { game: Game }) {
  const { library } = useApp();
  const entry = library.find((e) => e.gameId === game.id);
  return (
    <Link
      to={`/game/${game.id}`}
      className="group block rounded-2xl bg-white/5 ring-1 ring-white/10 p-2 transition hover:ring-cyan-400/40 hover:bg-white/10"
    >
      <Cover game={game} className="aspect-[3/4] w-full transition group-hover:scale-[1.02]" />
      <div className="mt-2 px-1 pb-1">
        <div className="truncate text-sm font-semibold text-slate-100">{game.title}</div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{game.year}</span>
          <span className="text-cyan-300 font-semibold">{game.communityRating.toFixed(1)}</span>
        </div>
        {entry && <div className="mt-1"><StatusBadge status={entry.status} /></div>}
      </div>
    </Link>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="bg-white/5 ring-1 ring-white/10 px-2 py-0.5 text-[11px] text-slate-300">
      {children}
    </span>
  );
}

export const inputClass =
  'bg-slate-950/60 ring-1 ring-white/15 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-cyan-400/60 rounded-none';

export const btnClass =
  'cursor-pointer px-4 py-2 text-sm font-semibold text-slate-100 bg-white/10 ring-1 ring-white/15 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-none';

export const btnPrimaryClass =
  'cursor-pointer px-4 py-2 text-sm font-bold text-slate-950 bg-gradient-to-r from-violet-400 to-cyan-300 hover:from-violet-300 hover:to-cyan-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-none';

export function RatingButtons({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onChange(value === n ? null : n)}
          className={`h-7 w-7 text-xs font-bold ring-1 transition cursor-pointer ${
            value != null && n <= value
              ? 'bg-gradient-to-br from-violet-500 to-cyan-400 text-slate-950 ring-transparent'
              : 'bg-white/5 text-slate-400 ring-white/15 hover:bg-white/15'
          }`}
          aria-label={`Rate ${n} out of 10`}
        >
          {n}
        </button>
      ))}
      {value != null && <span className="ml-2 self-center text-sm font-bold text-cyan-300">{value}/10</span>}
    </div>
  );
}
