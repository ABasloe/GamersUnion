import { NavLink, Outlet } from 'react-router-dom';
import { DesignSwitcher } from '../../components/DesignSwitcher';
import { useApp } from '../../store/AppContext';
import { EMBER } from './ui';

const links = [
  { to: '/', label: 'River', end: true },
  { to: '/groups', label: 'Fires' },
  { to: '/deck', label: 'Deck' },
  { to: '/browse', label: 'Browse' },
  { to: '/library', label: 'Logbook' },
  { to: '/profile', label: 'You' },
  { to: '/support', label: 'Support' },
];

export function Layout() {
  const { username } = useApp();
  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-300 antialiased">
      <header className="sticky top-0 z-20 border-b border-stone-800 bg-stone-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3">
          <NavLink to="/" className="font-serif text-lg italic tracking-tight text-stone-100">
            Gamers<span style={{ color: EMBER }}>Union</span>
          </NavLink>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-2.5 py-1 transition-colors ${
                    isActive ? 'text-stone-100 underline decoration-stone-500 underline-offset-8' : 'text-stone-500 hover:text-stone-300'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <span
              className="cursor-default px-2.5 py-1 text-stone-700"
              title="Room by the fire for what comes next"
            >
              +
            </span>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-xs text-stone-500">
            <span className="hidden sm:inline">{username}</span>
            <DesignSwitcher className="flex items-center gap-1.5 [&_select]:max-w-[150px] [&_select]:border [&_select]:border-stone-700 [&_select]:bg-stone-900 [&_select]:px-1.5 [&_select]:py-1 [&_select]:text-xs [&_select]:text-stone-400" />
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
