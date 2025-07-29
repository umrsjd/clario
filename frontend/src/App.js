import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, Header, HeroSection, AuthModal, GoogleCallback } from './components';
import FlashScreen from './FlashScreen';
import Dashboard from './Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/welcome" element={<FlashScreen />} />
          <Route path="/google-callback" element={<GoogleCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;