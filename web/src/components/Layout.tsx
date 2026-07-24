import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { DesignSwitcher } from './DesignSwitcher';

export function Layout() {
  const { username } = useApp();
  return (
    <div className="app-shell design-signal">
      <header className="topbar">
        <NavLink to="/" className="logo">
          🎮 Gamers<span>Union</span>
        </NavLink>
        <nav className="nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/browse">Browse</NavLink>
          <NavLink to="/library">My Games</NavLink>
          <NavLink to="/groups">Groups</NavLink>
          <NavLink to="/support">♥ Support</NavLink>
          <NavLink to="/profile" className="nav-profile">👤 {username}</NavLink>
        </nav>
        <DesignSwitcher />
      </header>
      <main className="page">
        <Outlet />
      </main>
      <footer className="footer">GamersUnion — track, rate, and discuss your games.</footer>
    </div>
  );
}
