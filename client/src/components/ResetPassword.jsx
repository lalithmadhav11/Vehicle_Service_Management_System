import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRegex.test(password)) {
      return setError('Password must be at least 8 chars long, contain uppercase, lowercase, number, and special character');
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/auth/resetpassword/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('Password updated successfully! You will be redirected shortly...');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error or server is down');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#111'
    }}>
      <div style={{
        background: 'var(--surface)', padding: '40px', borderRadius: '8px',
        width: '100%', maxWidth: '400px', border: '1px solid var(--border)'
      }}>
        <h2 className="oswald" style={{ fontSize: '2rem', marginBottom: '20px', color: '#fff', textAlign: 'center' }}>
          RESET PASSWORD
        </h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: '#888' }}>New Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: '#888' }}>Confirm Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="angled-button" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'RESETTING...' : 'RESET PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
