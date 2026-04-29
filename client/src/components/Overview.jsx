import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CARDS = [
  { key: 'vehiclesCount',       label: 'My Vehicles',     tab: '/vehicles',      btn: 'Manage Vehicles',  alertKey: null },
  { key: 'appointmentsCount',   label: 'Appointments',    tab: '/appointments',  btn: 'View Schedule',    alertKey: null },
  { key: 'pendingInvoices',     label: 'Pending Invoices',tab: '/invoices',      btn: 'View Invoices',    alertKey: 'pendingInvoices' },
  { key: 'unreadNotifications', label: 'New Notices',     tab: '/notifications', btn: 'Check Alerts',     alertKey: 'unreadNotifications' },
];

const Overview = ({ user }) => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    vehiclesCount: 0, appointmentsCount: 0, pendingInvoices: 0, unreadNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role === 'admin') {
      setLoading(false);
      return;
    }

    const fetchOverview = async () => {
      setLoading(true);
      try {
        const h = { Authorization: `Bearer ${user.token}` };
        const [vR, aR, iR, nR] = await Promise.all([
          fetch('/api/vehicles',     { headers: h }),
          fetch('/api/appointments', { headers: h }),
          fetch('/api/invoices',     { headers: h }),
          fetch('/api/notifications',{ headers: h }),
        ]);
        const vD = vR.ok ? await vR.json() : {};
        const aD = aR.ok ? await aR.json() : [];
        const iD = iR.ok ? await iR.json() : [];
        const nD = nR.ok ? await nR.json() : [];
        
        const unreadCount = Array.isArray(nD) ? nD.filter(n => !n.isRead).length : 0;
        
        setData({
          vehiclesCount:        Array.isArray(vD.vehicles) ? vD.vehicles.length : 0,
          appointmentsCount:    Array.isArray(aD) ? aD.length : 0,
          pendingInvoices:      Array.isArray(iD) ? iD.filter(i => i.paymentStatus === 'Pending').length : 0,
          unreadNotifications:  unreadCount,
        });
      } catch (err) {
        console.error('Overview fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [user]);

  if (user.role === 'admin') {
    return (
      <div style={{ textAlign: 'center', paddingTop: '80px', animation: 'fade-in 0.5s ease-out both' }}>
        <div style={{ width: '64px', height: '64px', margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>A</span>
        </div>
        <h3 className="oswald" style={{ fontSize: '2rem', marginBottom: '12px', letterSpacing: '1px' }}>Admin Control Centre</h3>
        <p style={{ color: '#888', marginBottom: '28px', fontSize: '1.1rem' }}>Manage users, metrics and system data.</p>
        <button onClick={() => navigate('/admin')} className="angled-button" style={{ padding: '12px 30px', fontSize: '1.05rem' }}>Go to Admin Panel</button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fade-in 0.45s ease-out both' }}>
      <h2 className="oswald" style={{ fontSize: '2.2rem', marginBottom: '28px', color: '#fff', letterSpacing: '1px' }}>
        At a Glance
      </h2>

      {loading ? (
        <div className="loading-container" style={{ marginTop: '60px' }}>
          <div className="spinner" />
          <span>Loading your stats…</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {CARDS.filter(card => {
            if (user.role === 'technician' && (card.key === 'pendingInvoices' || card.key === 'vehiclesCount')) {
              return false;
            }
            return true;
          }).map(({ key, label, tab, btn, alertKey }) => {
            const isAlert = alertKey && data[alertKey] > 0;
            const glowColor = isAlert
              ? (alertKey === 'pendingInvoices' ? 'rgba(231,76,60,0.35)' : 'rgba(243,156,18,0.35)')
              : 'var(--primary-glow)';
            const numColor = isAlert
              ? (alertKey === 'pendingInvoices' ? '#e74c3c' : '#f39c12')
              : 'var(--primary)';
            return (
              <div
                key={key}
                className="hover-card"
                onClick={() => navigate(tab)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  padding: '32px 28px', borderRadius: '6px',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  cursor: 'pointer',
                }}
              >
                <h3 className="oswald" style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#ccc' }}>{label}</h3>
                <div style={{ fontSize: '3.5rem', fontWeight: 700, color: numColor, marginBottom: '20px', lineHeight: 1 }}>
                  {data[key]}
                </div>
                <button className="ghost-button" style={{ width: '100%', padding: '10px', fontSize: '0.85rem', pointerEvents: 'none' }}>
                  {btn}
                </button>
                {/* Glow orb */}
                <div style={{
                  position: 'absolute', top: '-50px', right: '-50px',
                  background: glowColor, width: '160px', height: '160px',
                  borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none',
                }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Overview;
