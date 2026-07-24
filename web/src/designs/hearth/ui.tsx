import type { Game, PlayStatus } from '../../types';
import { STATUS_LABELS, STATUS_ORDER } from '../../components/statusMeta';

/* Hearth identity tokens — color is meaning, never decoration.
   ember = community heat · sage = you · everything else charcoal/ivory */
export const EMBER = '#c98a5e';
export const SAGE = '#a3b18a';
export const IVORY = '#ece7df';

export const inputCls =
  'bg-transparent border-b border-stone-600 px-1 py-1.5 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-stone-300';
export const selectCls =
  'bg-stone-900 border border-stone-700 px-2 py-1.5 text-sm text-stone-200 focus:outline-none focus:border-stone-400';
export const ghostBtn =
  'border border-stone-600 px-3 py-1.5 text-sm text-stone-300 hover:border-stone-300 hover:text-stone-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent';

export function Cover({ game, className = '' }: { game: Game; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 text-center ${className}`}
      style={{ background: `linear-gradient(155deg, ${game.cover.from}, ${game.cover.to})` }}
    >
      <span className="text-2xl drop-shadow">{game.cover.emoji}</span>
      <span className="px-1 text-[11px] font-semibold leading-tight text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,.6)]">
        {game.title}
      </span>
    </div>
  );
}

/** 1–10 rating as a row of tally marks; sage because a rating is *yours*. */
export function RatingRow({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <span className="inline-flex items-baseline gap-[3px]">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          aria-label={`Rate ${n} of 10`}
          onClick={() => onChange(value === n ? null : n)}
          className="h-5 w-[11px] cursor-pointer border-none bg-transparent p-0"
        >
          <span
            className="block h-full w-[3px]"
            style={{ background: value != null && n <= value ? SAGE : '#44403c' }}
          />
        </button>
      ))}
      {value != null && (
        <span className="ml-2 text-xs tabular-nums" style={{ color: SAGE }}>
          {value}/10
        </span>
      )}
    </span>
  );
}

export function StatusSelect({
  value,
  onChange,
}: {
  value: PlayStatus | '';
  onChange: (s: PlayStatus | null) => void;
}) {
  return (
    <select
      className={selectCls}
      value={value}
      onChange={(e) => onChange((e.target.value || null) as PlayStatus | null)}
    >
      <option value="">not in logbook</option>
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s].toLowerCase()}
        </option>
      ))}
    </select>
  );
}

export function Hairline() {
  return <div className="my-6 h-px w-full bg-stone-800" />;
}
