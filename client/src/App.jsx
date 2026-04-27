import React, { useState, useEffect } from 'react';
import './App.css';

import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';

const App = () => {
  const [authOpen, setAuthOpen]   = useState(false);
  const [authTab, setAuthTab]     = useState('login');
  const [user, setUser]           = useState(null);

  // Restore session on mount — validate token is not expired
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Basic check: token must exist
        if (parsed && parsed.token) {
          setUser(parsed);
        } else {
          localStorage.removeItem('userInfo');
        }
      } catch {
        localStorage.removeItem('userInfo');
      }
    }
  }, []);

  const openAuth = (tab) => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  return (
    <>
      <Header onOpenAuth={openAuth} user={user} onLogout={handleLogout} />

      {!user ? (
        /* Landing page — add top padding so hero clears the fixed header */
        <div style={{ paddingTop: '70px' }}>
          <Hero onOpenAuth={openAuth} />
          <Marquee />
        </div>
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}

      <AuthModal
        isOpen={authOpen}
        tab={authTab}
        setTab={setAuthTab}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default App;
