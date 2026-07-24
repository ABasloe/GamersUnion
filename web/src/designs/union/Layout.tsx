import '@fontsource/chakra-petch/500.css';
import '@fontsource/chakra-petch/600.css';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import { NavLink, Outlet } from 'react-router-dom';
import { DesignSwitcher } from '../../components/DesignSwitcher';
import { DISPLAY, GROUND, LINE, MOSS, MUTED, TEXT, focusRing } from './ui';

const LINKS = [
  { to: '/', label: 'River', end: true },
  { to: '/groups', label: 'Fires' },
  { to: '/deck', label: 'Deck' },
  { to: '/browse', label: 'Browse' },
  { to: '/library', label: 'Logbook' },
  { to: '/profile', label: 'You' },
  { to: '/support', label: 'Support' },
];

export function Layout() {
  return (
    <div
      className="flex min-h-screen flex-col antialiased"
      style={{ background: GROUND, color: TEXT, fontFamily: "'Public Sans', sans-serif" }}
    >
      <header className="sticky top-0 z-40 border-b" style={{ borderColor: LINE, background: 'rgba(18,16,13,0.95)' }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3">
          <NavLink to="/" className={`text-lg font-semibold tracking-wide ${focusRing}`} style={{ ...DISPLAY, color: TEXT }}>
            GAMERS<span style={{ color: MOSS }}>//</span>UNION
          </NavLink>
          <nav className="flex flex-wrap items-center gap-x-1">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-2.5 py-1 text-sm motion-safe:transition-colors ${focusRing} ${isActive ? '' : 'hover:text-[#e3ddd2]'}`
                }
                style={({ isActive }) => ({
                  ...DISPLAY,
                  color: isActive ? TEXT : MUTED,
                  borderBottom: isActive ? `2px solid ${MOSS}` : '2px solid transparent',
                })}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto">
            <DesignSwitcher className="flex items-center gap-1.5 text-xs [&_select]:border [&_select]:border-[#332d23] [&_select]:bg-[#1a1712] [&_select]:px-1.5 [&_select]:py-1 [&_select]:text-xs [&_select]:text-[#e3ddd2]" />
          </div>
        </div>
      </header>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-5 text-center text-xs" style={{ borderColor: LINE, color: MUTED }}>
        GamersUnion — log it, rate it, argue about it.
      </footer>
    </div>
  );
}
