import type { CSSProperties, ReactNode } from 'react';
import type { Game, PlayStatus } from '../../types';
import { STATUS_LABELS, STATUS_ORDER } from '../../components/statusMeta';

/* Union identity tokens.
   Color is meaning: ember = community heat, moss = you. Everything else
   stays on the charcoal/bone ground. Shape language: notched corners and
   slanted chips — never rounded rectangles. */
export const GROUND = '#12100d';
export const SURFACE = '#1a1712';
export const RAISED = '#211d16';
export const LINE = '#332d23';
export const TEXT = '#e3ddd2';
export const MUTED = '#8f8878';
export const EMBER = '#c46a37';
export const MOSS = '#98a67d';
export const DANGER = '#b5484d';

export const DISPLAY: CSSProperties = { fontFamily: "'Chakra Petch', sans-serif" };
export const MONO: CSSProperties = { fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: 'tabular-nums' };

export const NOTCH = 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)';
export const NOTCH_SM = 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)';
export const SLANT = 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)';

export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#98a67d]';

export const inputCls =
  `w-full border bg-transparent px-2.5 py-1.5 text-sm placeholder:text-[#6d675a] focus:outline-none focus:border-[#98a67d] border-[#332d23] text-[#e3ddd2]`;

export const selectCls =
  `border bg-[#1a1712] px-2 py-1.5 text-sm focus:outline-none focus:border-[#98a67d] border-[#332d23] text-[#e3ddd2]`;

export function Btn({
  children,
  onClick,
  disabled,
  primary,
  danger,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer border px-3.5 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 motion-safe:transition-colors ${focusRing}`}
      style={{
        clipPath: NOTCH_SM,
        ...DISPLAY,
        borderColor: danger ? DANGER : primary ? MOSS : LINE,
        background: primary ? MOSS : 'transparent',
        color: danger ? DANGER : primary ? GROUND : TEXT,
      }}
    >
      {children}
    </button>
  );
}

export function Chip({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 text-[11px]"
      style={{ clipPath: SLANT, background: RAISED, color: color ?? MUTED, ...MONO }}
    >
      {children}
    </span>
  );
}

export function Panel({
  children,
  className = '',
  edge,
}: {
  children: ReactNode;
  className?: string;
  edge?: string;
}) {
  return (
    <div
      className={`border ${className}`}
      style={{ clipPath: NOTCH, background: SURFACE, borderColor: LINE, borderLeft: edge ? `3px solid ${edge}` : undefined }}
    >
      {children}
    </div>
  );
}

/** Hard diagonal two-tone plate with a typographic monogram — no gradient, no emoji. */
export function Cover({ game, className = '' }: { game: Game; className?: string }) {
  const monogram = game.title
    .replace(/[^A-Za-z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div className={`relative flex flex-col justify-between overflow-hidden ${className}`} style={{ clipPath: NOTCH_SM, background: game.cover.to }}>
      <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', background: game.cover.from }} />
      <span className="relative px-1.5 pt-1 text-lg font-semibold text-white/95" style={DISPLAY}>
        {monogram}
      </span>
      <span className="relative px-1.5 pb-1 text-right text-[10px] leading-tight text-white/90" style={DISPLAY}>
        {game.title}
      </span>
    </div>
  );
}

/** 1–10 rating as slanted tally strokes. Moss — a rating is yours. */
export function RatingRow({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <span className="inline-flex items-baseline gap-[3px]">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          aria-label={`Rate ${n} of 10`}
          onClick={() => onChange(value === n ? null : n)}
          className={`h-5 w-[11px] cursor-pointer border-none bg-transparent p-0 ${focusRing}`}
        >
          <span
            className="block h-full w-[4px]"
            style={{ background: value != null && n <= value ? MOSS : LINE, transform: 'skewX(-12deg)' }}
          />
        </button>
      ))}
      {value != null && (
        <span className="ml-2 text-xs" style={{ color: MOSS, ...MONO }}>
          {value}/10
        </span>
      )}
    </span>
  );
}

export function StatusSelect({ value, onChange }: { value: PlayStatus | ''; onChange: (s: PlayStatus | null) => void }) {
  return (
    <select className={selectCls} value={value} onChange={(e) => onChange((e.target.value || null) as PlayStatus | null)}>
      <option value="">not in logbook</option>
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s].toLowerCase()}
        </option>
      ))}
    </select>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: MUTED, ...DISPLAY }}>
      {children}
    </p>
  );
}
