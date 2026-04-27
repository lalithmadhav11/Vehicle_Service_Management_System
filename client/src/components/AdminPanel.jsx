import React, { useState, useEffect, useCallback } from 'react';

const API = '/api';

const LoadingSpinner = ({ label = 'Loading…' }) => (
  <div className="loading-container"><div className="spinner" /><span>{label}</span></div>
);

const ROLE_STYLE = {
  admin:      { bg: 'rgba(231,76,60,0.15)',   color: '#e74c3c' },
  technician: { bg: 'rgba(52,152,219,0.15)',  color: '#3498db' },
  customer:   { bg: 'rgba(255,255,255,0.07)', color: '#aaa' },
};

const AdminPanel = ({ user }) => {
  const [metrics, setMetrics]     = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');

  const headers = { Authorization: `Bearer ${user.token}` };

  const fetchAdminData = useCallback(async () => {
    if (user.role !== 'admin') return;
    setLoading(true); setError('');
    try {
      const [mR, uR] = await Promise.all([
        fetch(`${API}/admin/metrics`, { headers }),
        fetch(`${API}/admin/users`,   { headers }),
      ]);
      if (mR.ok) setMetrics(await mR.json());
      else { const d = await mR.json(); throw new Error(d.message || 'Failed to load metrics'); }
      if (uR.ok) setUsersList(await uR.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.token, user.role]);

  useEffect(() => { fetchAdminData(); }, [fetchAdminData]);

  if (user.role !== 'admin') {
    return (
      <div className="empty-state">
        <div style={{
          display: 'inline-block', padding: '10px 18px', borderRadius: '4px',
          background: 'rgba(231,76,60,0.12)', color: '#e74c3c',
          fontWeight: 700, fontSize: '0.82rem', letterSpacing: '2px',
          textTransform: 'uppercase', marginBottom: '14px', border: '1px solid rgba(231,76,60,0.25)',
        }}>
          RESTRICTED
        </div>
        <strong style={{ color: '#e74c3c', display: 'block', marginBottom: '8px' }}>Access Denied</strong>
        <p>Administrator privileges required.</p>
      </div>
    );
  }

  const METRIC_CARDS = [
    { key: 'userCount',        label: 'Total Users',       icon: 'U', color: '#fff' },
    { key: 'vehicleCount',     label: 'Total Vehicles',    icon: 'V', color: '#fff' },
    { key: 'appointmentCount', label: 'Appointments',      icon: 'A', color: 'var(--primary)' },
    { key: 'totalRevenue',     label: 'Revenue Collected', icon: 'R', color: '#2ecc71', prefix: '₹' },
  ];

  const filteredUsers = usersList.filter(u => {
    const src = search.toLowerCase();
    return u.name.toLowerCase().includes(src) || u.email.toLowerCase().includes(src) || u.role.includes(src);
  });

  return (
    <div style={{ animation: 'fade-in 0.45s ease-out both' }}>
      <h2 className="oswald" style={{ fontSize: '2rem', color: '#fff', marginBottom: '28px' }}>
        ADMIN CONTROL PANEL
      </h2>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? <LoadingSpinner label="Loading system metrics…" /> : (
        <>
          {/* ── Metric Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '18px', marginBottom: '40px' }}>
            {METRIC_CARDS.map(({ key, label, icon, color, prefix = '' }) => (
              <div key={key} className="hover-card" style={{
                background: 'var(--surface)', padding: '24px 20px', borderRadius: '6px',
                border: '1px solid var(--border)', textAlign: 'center',
                animation: 'fade-in 0.4s ease-out both',
              }}>
                <div style={{
                  width: '40px', height: '40px', margin: '0 auto 12px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)'
                }}>{icon}</div>
                <div style={{ color: '#888', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>{label}</div>
                <div className="oswald" style={{ fontSize: '2.2rem', color, fontWeight: 700 }}>
                  {prefix}{typeof metrics?.[key] === 'number' ? metrics[key].toLocaleString() : '—'}
                </div>
              </div>
            ))}
          </div>

          {/* ── User Directory ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 className="oswald" style={{ fontSize: '1.6rem', color: '#fff' }}>USER DIRECTORY</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: '#555', fontSize: '0.85rem' }}>{usersList.length} users total</span>
              <input type="text" placeholder="Search users…" className="input-field"
                style={{ width: '220px' }} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#555' }}>No users found</td></tr>
                  ) : filteredUsers.map((u, i) => {
                    const rs = ROLE_STYLE[u.role] || ROLE_STYLE.customer;
                    return (
                      <tr key={u._id} style={{ animation: `fade-in 0.3s ease-out ${i * 30}ms both` }}>
                        <td style={{ color: '#444', fontSize: '0.8rem' }}>{i + 1}</td>
                        <td style={{ color: '#fff', fontWeight: 500 }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: rs.color + '22', color: rs.color, fontWeight: 700,
                            fontSize: '0.85rem', marginRight: '10px',
                          }}>{u.name.charAt(0).toUpperCase()}</div>
                          {u.name}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span style={{
                            padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem',
                            textTransform: 'uppercase', letterSpacing: '1px',
                            background: rs.bg, color: rs.color, fontWeight: 600,
                          }}>{u.role}</span>
                        </td>
                        <td style={{ color: '#555', fontSize: '0.82rem' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
