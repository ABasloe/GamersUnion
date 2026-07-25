import '@fontsource/chakra-petch/500.css';
import '@fontsource/chakra-petch/600.css';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ThemePicker } from './ThemePicker';
import { loadThemeId, saveThemeId, themeStyle } from './themes';
import { DISPLAY, GROUND, LINE, MOSS, MUTED, TEXT, focusRing } from './ui';

const LINKS = [
  { to: '/', label: 'River', end: true },
  { to: '/groups', label: 'Forum' },
  { to: '/deck', label: 'Deck' },
  { to: '/browse', label: 'Browse' },
  { to: '/library', label: 'Logbook' },
  { to: '/profile', label: 'You' },
  { to: '/support', label: 'Support' },
];

export function Layout() {
  const [themeId, setThemeId] = useState(loadThemeId);

  const pickTheme = (id: string) => {
    setThemeId(id);
    saveThemeId(id);
  };

  return (
    <div
      className="flex min-h-screen flex-col antialiased"
      style={{ ...themeStyle(themeId), background: GROUND, color: TEXT, fontFamily: "'Public Sans', sans-serif" }}
    >
      <header
        className="sticky top-0 z-40 border-b"
        style={{ borderColor: LINE, background: 'color-mix(in srgb, var(--gu-ground) 95%, transparent)' }}
      >
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
                  `px-2.5 py-1 text-sm motion-safe:transition-colors ${focusRing} ${isActive ? '' : 'hover:text-[var(--gu-text)]'}`
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
            <ThemePicker themeId={themeId} onChange={pickTheme} />
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
