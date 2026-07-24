import { THEMES } from './themes';
import { DISPLAY, focusRing } from './ui';

/** Theme picker: swaps the Union palette (CSS variables on the app root). */
export function ThemePicker({ themeId, onChange }: { themeId: string; onChange: (id: string) => void }) {
  return (
    <label className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--gu-muted)', ...DISPLAY }}>
      theme
      <select
        value={themeId}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Color theme"
        className={`border px-1.5 py-1 text-xs ${focusRing}`}
        style={{
          background: 'var(--gu-surface)',
          borderColor: 'var(--gu-line)',
          color: 'var(--gu-text)',
        }}
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label} — {t.blurb}
          </option>
        ))}
      </select>
    </label>
  );
}
