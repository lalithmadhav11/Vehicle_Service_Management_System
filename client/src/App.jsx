import React, { useState, useEffect } from 'react';
import './App.css';

import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';

const App = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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

  return (
    <>
      <Header onOpenAuth={openAuth} user={user} onLogout={handleLogout} />
      
      {!user ? (
        <>
          <Hero onOpenAuth={openAuth} />
          <Marquee />
        </>
      ) : (
        <Dashboard user={user} />
      )}

      <AuthModal 
        isOpen={authOpen} 
        tab={authTab} 
        setTab={setAuthTab} 
        onClose={() => setAuthOpen(false)} 
        onLoginSuccess={(userData) => {
          setUser(userData);
          localStorage.setItem('userInfo', JSON.stringify(userData));
        }}
      />
    </>
  );
};

export default App;
