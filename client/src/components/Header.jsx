import React from 'react';
import '../App.css';

const Header = ({ onOpenAuth, user, onLogout }) => {
  return (
    <nav style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '25px 6%',
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)'
    }}>
      <div className="oswald" style={{fontSize: '2.5rem', fontWeight: 700, letterSpacing: '2px'}}>
        AUTO<span style={{color: 'var(--primary)'}}>SERVE</span>
      </div>
      
      <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
        {user ? (
           <>
             <span style={{color: 'var(--text-muted)', marginRight: '15px'}}>Welcome, <strong style={{color: '#fff', letterSpacing: '1px'}}>{user.name?.toUpperCase()}</strong></span>
             <button className="ghost-button" onClick={onLogout} style={{padding: '10px 24px', fontSize: '0.9rem'}}>Logout</button>
           </>
        ) : (
           <>
             <button className="ghost-button" onClick={() => onOpenAuth('login')}>Sign In</button>
             <button className="angled-button" onClick={() => onOpenAuth('register')}>Register</button>
           </>
        )}
      </div>
    </nav>
  );
};

export default Header;
