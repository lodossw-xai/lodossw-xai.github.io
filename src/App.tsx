import type { ReactElement } from 'react';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LegalPage from './pages/LegalPage';
import BoardPage from './pages/BoardPage';
import NewsPage from './pages/NewsPage';

function App(): ReactElement {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        {/* Fallback to home */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
