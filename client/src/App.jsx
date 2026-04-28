import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import AuthModal from './components/AuthModal';
import DashboardLayout from './components/Dashboard';
import Overview from './components/Overview';
import Vehicles from './components/Vehicles';
import Appointments from './components/Appointments';
import ServiceRecords from './components/ServiceRecords';
import Invoices from './components/Invoices';
import Notifications from './components/Notifications';
import Technicians from './components/Technicians';
import AdminPanel from './components/AdminPanel';

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

      <Routes>
        {/* Landing Page */}
        <Route path="/" element={
          !user ? (
            <div style={{ paddingTop: '70px' }}>
              <Hero onOpenAuth={openAuth} />
              <Marquee />
            </div>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } />

        {/* Protected Dashboard Routes */}
        {user && (
          <Route element={<DashboardLayout user={user} onLogout={handleLogout} />}>
            <Route path="/dashboard" element={<Overview user={user} />} />
            <Route path="/vehicles" element={<Vehicles user={user} />} />
            <Route path="/appointments" element={<Appointments user={user} />} />
            <Route path="/services" element={<ServiceRecords user={user} />} />
            <Route path="/invoices" element={<Invoices user={user} />} />
            <Route path="/notifications" element={<Notifications user={user} />} />
            <Route path="/technicians" element={<Technicians user={user} />} />
            <Route path="/admin" element={<AdminPanel user={user} />} />
          </Route>
        )}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

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
