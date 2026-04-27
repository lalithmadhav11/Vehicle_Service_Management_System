import React, { useEffect, useState } from 'react';
import '../App.css';

const Header = ({ onOpenAuth, user, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="main-header" style={{
      background: scrolled ? 'rgba(0,0,0,0.97)' : 'rgba(0,0,0,0.75)',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.8)' : 'none',
      transition: 'background 0.3s, box-shadow 0.3s',
    }}>
      <div className="oswald" style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '2px', cursor: 'default' }}>
        AUTO<span style={{ color: 'var(--primary)' }}>SERVE</span>
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Welcome, <strong style={{ color: '#fff', letterSpacing: '1px' }}>{user.name?.toUpperCase()}</strong>
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem',
              textTransform: 'uppercase', letterSpacing: '1px',
              background: user.role === 'admin' ? 'rgba(231,76,60,0.2)' : user.role === 'technician' ? 'rgba(52,152,219,0.2)' : 'rgba(255,255,255,0.1)',
              color: user.role === 'admin' ? '#e74c3c' : user.role === 'technician' ? '#3498db' : '#aaa',
            }}>{user.role}</span>
            <button className="ghost-button" onClick={onLogout} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="ghost-button" onClick={() => onOpenAuth('login')} style={{ padding: '10px 22px' }}>
              Sign In
            </button>
            <button className="angled-button" onClick={() => onOpenAuth('register')} style={{ padding: '10px 22px' }}>
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;
