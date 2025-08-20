import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, Header, HeroSection, GoogleCallback } from './components';
import FlashScreen from './FlashScreen';
import Dashboard from './Dashboard';
import AuthPage from './AuthPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header />
                <HeroSection />
              </>
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/welcome"
            element={
              <>
                <Header />
                <FlashScreen />
              </>
            }
          />
          <Route path="/google-callback" element={<GoogleCallback />} />
          <Route
            path="/dashboard"
            element={
              <>
                <Header />
                <Dashboard />
              </>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;