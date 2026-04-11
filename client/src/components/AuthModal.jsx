import React, { useState } from 'react';
import '../App.css';

const AuthModal = ({ isOpen, tab, setTab, onClose, onLoginSuccess }) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', role: 'customer', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginChange = (e) => setLoginData({...loginData, [e.target.name]: e.target.value});
  const handleRegisterChange = (e) => setRegisterData({...registerData, [e.target.name]: e.target.value});

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if(res.ok) {
        setSuccessMsg("Logged in successfully!");
        if (onLoginSuccess) onLoginSuccess(data);
        setTimeout(() => onClose(), 1500);
      } else throw new Error(data.message || 'Login failed');
    } catch(err) {
      setErrorMsg(err.message);
    } finally { setLoading(false); }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      const data = await res.json();
      if(res.ok) {
        setSuccessMsg("Registered successfully!");
        if (onLoginSuccess) onLoginSuccess(data);
        setTimeout(() => onClose(), 1500);
      } else throw new Error(data.message || 'Registration failed');
    } catch(err) {
      setErrorMsg(err.message);
    } finally { setLoading(false); }
  };
  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => { if(e.target.className.includes('modal-overlay')) onClose(); }}>
      <div className="modal-content" style={{minHeight: '600px'}}>
        
        {/* Left Brand Panel */}
        <div style={{flex: 1, background: 'linear-gradient(135deg, #cc0000 0%, var(--primary) 100%)', padding: '60px 40px', position: 'relative', overflow: 'hidden'}} className="hidden md:flex flex-col justify-center">
          <div style={{position: 'relative', zIndex: 2}}>
            <div className="oswald" style={{fontSize: '3rem', fontWeight: 700, color: '#fff', marginBottom: '25px', textShadow: '0 5px 15px rgba(0,0,0,0.4)', letterSpacing: '2px'}}>AUTO<span style={{color: '#111'}}>SERVE</span></div>
            <h3 className="oswald" style={{fontSize: '2.5rem', color: '#fff', marginBottom: '30px', lineHeight: 1.1, textTransform: 'uppercase'}}>Industrial Grade Vehicle Management</h3>
            <ul style={{listStyle: 'none', color: '#fff', fontSize: '1.1rem', lineHeight: 2.2}}>
              <li style={{display: 'flex', alignItems: 'center'}}><span style={{background: '#111', color: 'var(--primary)', width: 25, height: 25, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', marginRight: '15px'}}>✓</span> Live Repair Tracking</li>
              <li style={{display: 'flex', alignItems: 'center'}}><span style={{background: '#111', color: 'var(--primary)', width: 25, height: 25, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', marginRight: '15px'}}>✓</span> Seamless Subscriptions</li>
              <li style={{display: 'flex', alignItems: 'center'}}><span style={{background: '#111', color: 'var(--primary)', width: 25, height: 25, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', marginRight: '15px'}}>✓</span> Fleet & Garage Integration</li>
            </ul>
          </div>
          
          <div style={{position: 'absolute', bottom: '-80px', right: '-80px', width: '400px', height: '400px', background: 'rgba(0,0,0,0.15)', borderRadius: '50%'}}></div>
          <div style={{position: 'absolute', top: '-40px', left: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.08)', transform: 'rotate(45deg)'}}></div>
        </div>

        {/* Right Form Panel */}
        <div style={{flex: 1.2, padding: '60px 50px', background: 'var(--surface)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left'}}>
          <button onClick={onClose} style={{position: 'absolute', top: '25px', right: '30px', background: 'transparent', border: 'none', color: '#666', fontSize: '1.8rem', cursor: 'pointer', transition: '0.3s'}} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#666'}>✕</button>
          
          <div style={{display: 'flex', gap: '30px', marginBottom: '25px', borderBottom: '1px solid var(--border)'}}>
            <button onClick={()=>{setTab('login'); setErrorMsg(''); setSuccessMsg('');}} style={{background: 'transparent', border: 'none', color: tab === 'login' ? 'var(--primary)' : '#666', padding: '10px 0', fontSize: '1.0rem', borderBottom: tab === 'login' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', letterSpacing: '1px', transition: '0.3s', fontWeight: 600}} className="oswald">SIGN IN</button>
            <button onClick={()=>{setTab('register'); setErrorMsg(''); setSuccessMsg('');}} style={{background: 'transparent', border: 'none', color: tab === 'register' ? 'var(--primary)' : '#666', padding: '10px 0', fontSize: '1.0rem', borderBottom: tab === 'register' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', letterSpacing: '1px', transition: '0.3s', fontWeight: 600}} className="oswald">REGISTER</button>
          </div>

          {errorMsg && <div style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '15px' }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: '#4CAF50', fontSize: '0.85rem', marginBottom: '15px' }}>{successMsg}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left'}}>Account Email</label>
                <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} className="input-field" placeholder="owner@garage.com" required />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left'}}>Password</label>
                <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} className="input-field" placeholder="••••••••" required />
              </div>
              <div style={{textAlign: 'right'}}>
                <a href="#" style={{color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', transition: '0.3s'}} onMouseOver={e=>e.target.style.textDecoration='underline'} onMouseOut={e=>e.target.style.textDecoration='none'}>Forgot Password?</a>
              </div>
              
              <button type="submit" disabled={loading} className="angled-button" style={{alignSelf: 'center', marginTop: '15px', backgroundImage: 'linear-gradient(90deg, #cc0000 0%, #ff4d4d 50%, #cc0000 100%)', backgroundSize: '200% auto', animation: loading ? 'none' : 'shimmer 3s infinite linear', opacity: loading ? 0.7 : 1, border: '1px solid rgba(255,26,26,0.5)'}}>
                {loading ? 'PROCESSING...' : 'SIGN IN'}
              </button>
              
              <div style={{textAlign: 'center', margin: '20px 0', color: '#555', position: 'relative'}}>
                <span style={{background: 'var(--surface)', padding: '0 15px', position: 'relative', zIndex: 2, fontSize: '0.8rem', letterSpacing: '2px'}}>OR CONTINUE WITH</span>
                <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)', zIndex: 1}}></div>
              </div>
              
              <div style={{display: 'flex', gap: '20px'}}>
                <button className="ghost-button" style={{flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', gap: '10px'}}><span style={{color: '#fff'}}>G</span> Google</button>
                <button className="ghost-button" style={{flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', gap: '10px'}}><span style={{color: '#fff'}}>GH</span> GitHub</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left'}}>Full Name</label>
                <input type="text" name="name" value={registerData.name} onChange={handleRegisterChange} className="input-field" placeholder="John Doe" required />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left'}}>Email Address</label>
                <input type="email" name="email" value={registerData.email} onChange={handleRegisterChange} className="input-field" placeholder="john@example.com" required />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left'}}>Account Role</label>
                <select name="role" value={registerData.role} onChange={handleRegisterChange} className="input-field" style={{appearance: 'none', cursor: 'pointer'}}>
                  <option value="customer">Vehicle Owner</option>
                  <option value="technician">Service Technician</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left'}}>Create Password</label>
                <input type="password" name="password" value={registerData.password} onChange={handleRegisterChange} className="input-field" placeholder="••••••••" required />
              </div>
              <button type="submit" disabled={loading} className="angled-button" style={{alignSelf: 'center', marginTop: '15px', opacity: loading ? 0.7 : 1}}>
                {loading ? 'PROCESSING...' : 'REGISTER'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
