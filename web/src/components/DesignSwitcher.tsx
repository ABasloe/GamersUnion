import { useEffect, useState } from 'react';

export const DESIGNS = [
  { id: 'midnight', label: '🌙 Midnight', blurb: 'Default dark design' },
  { id: 'daylight', label: '☀️ Daylight', blurb: 'Clean light, Goodreads-inspired' },
  { id: 'arcade', label: '👾 Arcade', blurb: 'Retro CRT terminal' },
] as const;

export type DesignId = (typeof DESIGNS)[number]['id'];

const STORAGE_KEY = 'gamers-union-design';

function loadDesign(): DesignId {
  const saved = localStorage.getItem(STORAGE_KEY);
  return DESIGNS.some((d) => d.id === saved) ? (saved as DesignId) : 'midnight';
}

/**
 * UX/UI design tester: swaps the entire base styling of the site (not just
 * colors) via a data-design attribute on <html>, so testers can compare
 * complete design directions in place.
 */
export function DesignSwitcher() {
  const [design, setDesign] = useState<DesignId>(loadDesign);

  useEffect(() => {
    document.documentElement.dataset.design = design;
    localStorage.setItem(STORAGE_KEY, design);
  }, [design]);

  return (
    <label className="design-switcher" title="UI design tester — switch the whole site design">
      🎨
      <select value={design} onChange={(e) => setDesign(e.target.value as DesignId)} aria-label="Site design">
        {DESIGNS.map((d) => (
          <option key={d.id} value={d.id}>{d.label} — {d.blurb}</option>
        ))}
      </select>
    </label>
  );
}
