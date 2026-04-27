import React, { useState } from 'react';
import '../App.css';

const AuthModal = ({ isOpen, tab, setTab, onClose, onLoginSuccess }) => {
  const [loginData, setLoginData]       = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading]           = useState(false);
  const [errorMsg, setErrorMsg]         = useState('');
  const [successMsg, setSuccessMsg]     = useState('');
  const [showPwd, setShowPwd]           = useState(false);

  const reset = () => { setErrorMsg(''); setSuccessMsg(''); };
  const handleLoginChange    = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); reset();
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Welcome back! Redirecting to your dashboard...');
        if (onLoginSuccess) onLoginSuccess(data);
        setTimeout(() => onClose(), 1200);
      } else {
        setErrorMsg(data.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setErrorMsg('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); reset();
    if (registerData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...registerData, role: 'customer' }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Account created successfully. Redirecting...');
        if (onLoginSuccess) onLoginSuccess(data);
        setTimeout(() => onClose(), 1200);
      } else {
        setErrorMsg(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setErrorMsg('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const pwdToggleStyle = {
    position: 'absolute', right: '14px', bottom: '13px',
    background: 'transparent', border: 'none', color: '#555',
    cursor: 'pointer', fontSize: '0.72rem', textTransform: 'uppercase',
    letterSpacing: '0.8px', padding: 0, transition: 'color 0.2s',
  };

  return (
    <div
      className={`modal-overlay ${isOpen ? 'active' : ''}`}
      onClick={(e) => { if (e.target.classList.contains('modal-overlay')) onClose(); }}
    >
      <div className="modal-content" style={{ minHeight: '520px' }}>

        {/* Left Brand Panel */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #8b0000 0%, var(--primary) 100%)',
          padding: '50px 40px', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="oswald" style={{ fontSize: '2.8rem', fontWeight: 700, color: '#fff', marginBottom: '20px', letterSpacing: '2px' }}>
              AUTO<span style={{ color: '#111' }}>SERVE</span>
            </div>
            <h3 className="oswald" style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '25px', lineHeight: 1.2 }}>
              Industrial Grade Vehicle Management
            </h3>
            <ul style={{ listStyle: 'none', color: '#fff', fontSize: '1rem', lineHeight: 2.5 }}>
              {['Live Repair Tracking', 'Seamless Scheduling', 'Fleet & Garage Integration'].map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    background: 'rgba(0,0,0,0.3)', color: '#fff', width: 22, height: 22,
                    borderRadius: '50%', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', fontSize: '0.75rem', flexShrink: 0,
                  }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '320px', height: '320px', background: 'rgba(0,0,0,0.15)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.07)', transform: 'rotate(45deg)' }} />
        </div>

        {/* Right Form Panel */}
        <div style={{
          flex: 1.3, padding: '50px 45px', background: 'var(--surface)',
          position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: '20px', right: '24px',
            background: 'transparent', border: 'none', color: '#555',
            fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1, transition: 'color 0.2s',
          }}
            onMouseOver={(e) => (e.target.style.color = '#fff')}
            onMouseOut={(e) => (e.target.style.color = '#555')}
          >✕</button>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '28px', borderBottom: '1px solid var(--border)' }}>
            {['login', 'register'].map((t) => (
              <button key={t} onClick={() => { setTab(t); reset(); }} className="oswald" style={{
                background: 'transparent', border: 'none',
                color: tab === t ? 'var(--primary)' : '#555',
                padding: '10px 0', fontSize: '1rem',
                borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer', letterSpacing: '1px', transition: '0.2s', fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {errorMsg   && <div className="alert alert-error">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {/* LOGIN FORM */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={labelStyle}>Account Email</label>
                <input type="email" name="email" value={loginData.email} onChange={handleLoginChange}
                  className="input-field" placeholder="owner@garage.com" required autoComplete="email" />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Password</label>
                <input type={showPwd ? 'text' : 'password'} name="password"
                  value={loginData.password} onChange={handleLoginChange}
                  className="input-field" placeholder="••••••••" required autoComplete="current-password"
                  style={{ paddingRight: '60px' }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={pwdToggleStyle}
                  onMouseOver={e => (e.target.style.color = '#fff')}
                  onMouseOut={e  => (e.target.style.color = '#555')}
                >{showPwd ? 'HIDE' : 'SHOW'}</button>
              </div>
              <button type="submit" disabled={loading} className="angled-button" style={{
                marginTop: '8px', opacity: loading ? 0.7 : 1,
                backgroundImage: loading ? undefined : 'linear-gradient(90deg, #cc0000, #ff4444, #cc0000)',
                backgroundSize: '200%',
                animation: loading ? 'none' : 'shimmer 2.5s infinite linear',
              }}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            /* REGISTER FORM - customers only */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" name="name" value={registerData.name} onChange={handleRegisterChange}
                  className="input-field" placeholder="John Doe" required autoComplete="name" />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" name="email" value={registerData.email} onChange={handleRegisterChange}
                  className="input-field" placeholder="john@example.com" required autoComplete="email" />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Create Password <span style={{ color: '#555' }}>(min. 6 chars)</span></label>
                <input type={showPwd ? 'text' : 'password'} name="password"
                  value={registerData.password} onChange={handleRegisterChange}
                  className="input-field" placeholder="••••••••" required autoComplete="new-password"
                  style={{ paddingRight: '60px' }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={pwdToggleStyle}
                  onMouseOver={e => (e.target.style.color = '#fff')}
                  onMouseOut={e  => (e.target.style.color = '#555')}
                >{showPwd ? 'HIDE' : 'SHOW'}</button>
              </div>
              <p style={{
                fontSize: '0.78rem', color: '#555', lineHeight: 1.5,
                padding: '10px 14px', borderRadius: '4px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                This form registers you as a <strong style={{ color: '#aaa' }}>Vehicle Owner</strong>.
                Technician accounts are created exclusively by the administrator.
              </p>
              <button type="submit" disabled={loading} className="angled-button" style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block', marginBottom: '6px', color: '#666',
  fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px',
};

export default AuthModal;
