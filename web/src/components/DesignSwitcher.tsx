import { DESIGNS } from '../designs';
import { useDesign } from '../designs/DesignContext';

/**
 * UX/UI design tester: swaps the ENTIRE site implementation — layout, page
 * components, and styling — between complete design directions, so testers
 * can compare whole websites, not just color themes.
 */
export function DesignSwitcher({ className }: { className?: string }) {
  const { designId, setDesignId } = useDesign();
  return (
    <label className={className ?? 'design-switcher'} title="UI design tester — switch the whole site design">
      <span>design</span>
      <select value={designId} onChange={(e) => setDesignId(e.target.value)} aria-label="Site design">
        {DESIGNS.map((d) => (
          <option key={d.id} value={d.id}>{d.label} — {d.blurb}</option>
        ))}
      </select>
    </label>
  );
}
