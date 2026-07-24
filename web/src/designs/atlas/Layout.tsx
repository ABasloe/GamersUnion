import { NavLink, Link, Outlet } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { DesignSwitcher } from '../../components/DesignSwitcher';

const navCls = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 text-sm uppercase tracking-[0.15em] transition-colors ${
    isActive ? 'text-emerald-900 font-bold' : 'text-neutral-600 hover:text-emerald-900'
  }`;

export function Layout() {
  const { username } = useApp();
  return (
    <div className="min-h-screen bg-[#faf7f0] font-sans text-neutral-800 antialiased">
      {/* Slim utility bar */}
      <div className="border-b border-neutral-300 bg-[#f3efe5]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-1.5 text-xs text-neutral-600">
          <span className="italic">Track, rate & discuss your games — est. 2026</span>
          <div className="flex items-center gap-4">
            <DesignSwitcher className="flex items-center gap-1 text-xs [&_select]:border [&_select]:border-neutral-300 [&_select]:bg-white [&_select]:px-1 [&_select]:py-0.5 [&_select]:text-xs" />
            <Link to="/profile" className="hover:text-emerald-900 hover:underline">
              {username}
            </Link>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <header className="border-b-2 border-neutral-900 bg-[#faf7f0]">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-4 text-center">
          <Link to="/" className="font-serif text-5xl font-black tracking-tight text-neutral-900">
            Gamers<span className="text-emerald-900">Union</span>
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-neutral-500">
            The gamer&rsquo;s review of record
          </p>
        </div>
        <nav className="mx-auto flex max-w-5xl flex-wrap justify-center border-t border-neutral-300 px-4">
          <NavLink to="/" end className={navCls}>Front Page</NavLink>
          <NavLink to="/browse" className={navCls}>Browse</NavLink>
          <NavLink to="/library" className={navCls}>My Games</NavLink>
          <NavLink to="/groups" className={navCls}>Groups</NavLink>
          <NavLink to="/profile" className={navCls}>Profile</NavLink>
          <NavLink to="/support" className={navCls}>Support Us</NavLink>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20">
        <Outlet />
      </main>

      <footer className="border-t-2 border-neutral-900 bg-[#f3efe5]">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-sm text-neutral-600 sm:grid-cols-3">
          <div>
            <p className="font-serif text-lg font-bold text-neutral-900">GamersUnion</p>
            <p className="mt-2 leading-relaxed">A quiet place to keep your play history, opinions, and people.</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wider text-neutral-500">Sections</p>
            <ul className="mt-2 space-y-1">
              <li><Link to="/browse" className="hover:text-emerald-900 hover:underline">Browse games</Link></li>
              <li><Link to="/groups" className="hover:text-emerald-900 hover:underline">Groups</Link></li>
              <li><Link to="/library" className="hover:text-emerald-900 hover:underline">Your library</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wider text-neutral-500">Colophon</p>
            <p className="mt-2 leading-relaxed">Set in serif &amp; sans on warm paper. Atlas edition.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
