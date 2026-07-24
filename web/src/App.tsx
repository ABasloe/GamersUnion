import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { DesignProvider, useDesign } from './designs/DesignContext';

function DesignRoutes() {
  const { design, designId } = useDesign();
  const P = design.pages;
  return (
    <Routes key={designId}>
      <Route element={<P.Layout />}>
        <Route path="/" element={<P.Home />} />
        <Route path="/browse" element={<P.Browse />} />
        <Route path="/game/:id" element={<P.GameDetail />} />
        <Route path="/library" element={<P.Library />} />
        <Route path="/groups" element={<P.Groups />} />
        <Route path="/groups/:id" element={<P.GroupDetail />} />
        <Route path="/profile" element={<P.Profile />} />
        {design.extras?.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DesignProvider>
        <HashRouter>
          <DesignRoutes />
        </HashRouter>
      </DesignProvider>
    </AppProvider>
  );
}
