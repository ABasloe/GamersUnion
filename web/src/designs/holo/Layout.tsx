import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { DesignSwitcher } from '../../components/DesignSwitcher';
import { GradientText } from './ui';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '◈', end: true },
  { to: '/browse', label: 'Browse', icon: '⌕' },
  { to: '/library', label: 'My Games', icon: '▤' },
  { to: '/groups', label: 'Groups', icon: '⬡' },
  { to: '/profile', label: 'Profile', icon: '◉' },
];

export function Layout() {
  const { username } = useApp();
  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-200 antialiased">
      <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-white/10 bg-slate-950/90 md:w-56">
        <NavLink to="/" className="flex items-center gap-2 px-3 py-5 md:px-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center bg-gradient-to-br from-violet-500 to-cyan-400 text-lg font-black text-slate-950">
            G
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight text-white md:block">
            Gamers<GradientText>Union</GradientText>
          </span>
        </NavLink>
        <nav className="mt-2 flex flex-1 flex-col gap-1 px-2 md:px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/25 to-cyan-400/10 text-white ring-1 ring-violet-400/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-3 py-3 md:px-4">
          <div className="mb-2 hidden truncate text-xs text-slate-500 md:block">Signed in as {username}</div>
          <DesignSwitcher className="flex items-center gap-2 text-sm [&>select]:w-full [&>select]:bg-slate-900 [&>select]:text-xs [&>select]:text-slate-300 [&>select]:ring-1 [&>select]:ring-white/15 [&>select]:px-1 [&>select]:py-1 [&>select]:hidden md:[&>select]:block" />
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
