import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { BirthdayPage } from './pages/BirthdayPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/view/:id" element={<BirthdayPage />} />
      </Routes>
    </Router>
  );
}

export default App;