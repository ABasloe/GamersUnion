import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { Layout } from './designs/union/Layout';
import { Home } from './designs/union/Home';
import { Browse } from './designs/union/Browse';
import { GameDetail } from './designs/union/GameDetail';
import { Library } from './designs/union/Library';
import { Groups, GroupDetail } from './designs/union/Fires';
import { Profile } from './designs/union/Profile';
import { Deck } from './designs/union/Deck';
import { Support } from './pages/Support';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/library" element={<Library />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/deck" element={<Deck />} />
            <Route path="/support" element={<Support />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
