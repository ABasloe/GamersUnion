import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { GameDetail } from './pages/GameDetail';
import { Library } from './pages/Library';
import { Groups } from './pages/Groups';
import { GroupDetail } from './pages/GroupDetail';
import { Profile } from './pages/Profile';

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
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
