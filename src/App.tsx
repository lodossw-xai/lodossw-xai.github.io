import type { ReactElement } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LegalPage from './pages/LegalPage';
import AgencyPage from './pages/AgencyPage';

function App(): ReactElement {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AgencyPage page="about" />} />
        <Route path="/work" element={<AgencyPage page="work" />} />
        <Route path="/careers" element={<AgencyPage page="careers" />} />
        <Route path="/contact" element={<AgencyPage page="contact" />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        {/* Fallback to home */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
