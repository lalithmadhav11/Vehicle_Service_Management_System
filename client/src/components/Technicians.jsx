import React, { useState, useEffect, useCallback } from 'react';

const API = '/api';

const LoadingSpinner = ({ label = 'Loading...' }) => (
  <div className="loading-container"><div className="spinner" /><span>{label}</span></div>
);

const Technicians = ({ user }) => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [searchTerm, setSearchTerm]   = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', specialization: '', experience: '',
  });

  const headers = { Authorization: `Bearer ${user.token}` };

  const fetchTechnicians = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/technicians`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch technicians');
      setTechnicians(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.token]);

  useEffect(() => { fetchTechnicians(); }, [fetchTechnicians]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res  = await fetch(`${API}/technicians`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, experience: Number(formData.experience) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add technician');
      setSuccess('Technician account created successfully.');
      setShowAddForm(false);
      setFormData({ name: '', email: '', password: '', specialization: '', experience: '' });
      fetchTechnicians();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (user.role === 'customer') {
    return (
      <div className="empty-state">
        <div style={{
          display: 'inline-block', padding: '10px 18px', borderRadius: '4px',
          background: 'rgba(231,76,60,0.12)', color: '#e74c3c',
          fontWeight: 700, fontSize: '0.82rem', letterSpacing: '2px',
          textTransform: 'uppercase', marginBottom: '14px', border: '1px solid rgba(231,76,60,0.25)',
        }}>
          ACCESS RESTRICTED
        </div>
        <strong style={{ color: '#e74c3c', display: 'block', marginBottom: '8px' }}>Access Denied</strong>
        <p>Only staff and administrators can view the technician directory.</p>
      </div>
    );
  }

  const filtered = technicians.filter(t => {
    const src = searchTerm.toLowerCase();
    return t.name.toLowerCase().includes(src) || t.specialization.toLowerCase().includes(src);
  });

  /* Avatar color based on name */
  const avatarColors = ['#CC0000', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c'];
  const getColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div style={{ animation: 'fade-in 0.45s ease-out both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="oswald" style={{ fontSize: '2rem', color: '#fff' }}>TECHNICIAN DIRECTORY</h2>
        {user.role === 'admin' && (
          <button onClick={() => { setShowAddForm(!showAddForm); setError(''); }} className="ghost-button">
            {showAddForm ? 'CANCEL' : '+ ADD TECHNICIAN'}
          </button>
        )}
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ── Add Technician Form (Admin Only) ── */}
      {showAddForm && user.role === 'admin' && (
        <form onSubmit={handleAddSubmit} style={{
          background: 'var(--surface)', padding: '28px', borderRadius: '6px',
          marginBottom: '28px', border: '1px solid var(--border)',
          animation: 'slideUp 0.3s ease-out both',
        }}>
          <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.6 }}>
            Fill in the details below to register a new technician. They will use the
            email and password you set here to log in to their dashboard.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '18px',
          }}>
            <div>
              <label style={lbl}>Full Name</label>
              <input type="text" name="name" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="input-field" placeholder="e.g. Ravi Kumar" required />
            </div>
            <div>
              <label style={lbl}>Email Address</label>
              <input type="email" name="email" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="input-field" placeholder="technician@garage.com" required />
            </div>
            <div style={{ position: 'relative' }}>
              <label style={lbl}>Set Password <span style={{ color: '#555' }}>(min. 6 chars)</span></label>
              <input
                type={showPass ? 'text' : 'password'}
                name="password" value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="input-field" placeholder="Temp password" required
                style={{ paddingRight: '56px' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: '12px', bottom: '12px',
                background: 'transparent', border: 'none', color: '#666',
                cursor: 'pointer', fontSize: '0.72rem', textTransform: 'uppercase',
                letterSpacing: '0.8px', padding: 0, transition: 'color 0.2s',
              }}
                onMouseOver={e => (e.target.style.color = '#fff')}
                onMouseOut={e  => (e.target.style.color = '#666')}
              >{showPass ? 'HIDE' : 'SHOW'}</button>
            </div>
            <div>
              <label style={lbl}>Specialization</label>
              <input type="text" name="specialization" value={formData.specialization}
                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                className="input-field" placeholder="e.g. Engine Diagnostics" required />
            </div>
            <div>
              <label style={lbl}>Experience (Years)</label>
              <input type="number" name="experience" value={formData.experience} min="0" max="50"
                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                className="input-field" placeholder="5" required />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" disabled={submitting} className="angled-button" style={{ width: '100%' }}>
                {submitting ? 'Creating Account...' : 'CREATE TECHNICIAN'}
              </button>
            </div>
          </div>
        </form>
      )}

      {!loading && technicians.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <input type="text" placeholder="Search by name or specialization..."
            className="input-field" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} />
        </div>
      )}

      {loading ? <LoadingSpinner label="Loading technicians..." /> : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: '#555', fontSize: '1.5rem', fontWeight: 700,
          }}>
            T
          </div>
          <strong style={{ color: '#888' }}>
            {technicians.length === 0 ? 'No Technicians Registered' : 'No Matches Found'}
          </strong>
          {technicians.length === 0 && user.role === 'admin' && (
            <p style={{ marginTop: '8px', fontSize: '0.88rem' }}>
              Use the <strong style={{ color: '#fff' }}>+ ADD TECHNICIAN</strong> button above to register the first technician.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }}>
          {filtered.map((tech, i) => (
            <div key={tech._id} className="hover-card" style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              padding: '28px 22px', borderRadius: '6px', textAlign: 'center',
              animation: `fade-in 0.4s ease-out ${i * 60}ms both`,
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: `${getColor(tech.name)}22`,
                border: `2px solid ${getColor(tech.name)}`,
                margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: getColor(tech.name), fontSize: '1.8rem', fontWeight: 700,
              }}>
                {tech.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="oswald" style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{tech.name}</h3>
              <p style={{ color: 'var(--primary)', fontSize: '0.88rem', marginBottom: '8px' }}>{tech.specialization}</p>
              {user.role === 'admin' && tech.email && (
                <p style={{ color: '#555', fontSize: '0.78rem', marginBottom: '8px' }}>{tech.email}</p>
              )}
              <div style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)', color: '#888', fontSize: '0.82rem',
              }}>
                {tech.experience} yr{tech.experience !== 1 ? 's' : ''} experience
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const lbl = {
  display: 'block', marginBottom: '6px', color: '#666',
  fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px',
};

export default Technicians;
