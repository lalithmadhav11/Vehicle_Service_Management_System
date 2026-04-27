import React, { useState, useEffect } from 'react';
import Vehicles      from './Vehicles';
import Appointments  from './Appointments';
import AdminPanel    from './AdminPanel';
import Invoices      from './Invoices';
import ServiceRecords from './ServiceRecords';
import Technicians   from './Technicians';
import Notifications from './Notifications';

/* ── nav icon map ── */
const ICONS = {
  overview:      'O',
  vehicles:      'V',
  appointments:  'A',
  services:      'S',
  invoices:      'I',
  notifications: 'N',
  technicians:   'T',
  admin:         'A',
};

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab]     = useState('overview');
  const [overviewData, setOverviewData] = useState({
    vehiclesCount: 0, appointmentsCount: 0, pendingInvoices: 0, unreadNotifications: 0,
  });
  const [unread, setUnread] = useState(0);
  const [overviewLoading, setOverviewLoading] = useState(false);

  /* Build nav list based on role */
  const navItems = [
    { id: 'overview',      label: 'Overview' },
    { id: 'vehicles',      label: 'Vehicles' },
    { id: 'appointments',  label: 'Appointments' },
    { id: 'services',      label: 'Service Records' },
    { id: 'invoices',      label: 'Invoices' },
    { id: 'notifications', label: 'Notifications' },
  ];
  if (user.role !== 'customer') navItems.push({ id: 'technicians', label: 'Technicians' });
  if (user.role === 'admin')    navItems.push({ id: 'admin',       label: 'Admin Panel' });

  /* Fetch overview stats */
  useEffect(() => {
    if (user.role === 'admin' || activeTab !== 'overview') return;

    const fetchOverview = async () => {
      setOverviewLoading(true);
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
        setUnread(unreadCount);
        setOverviewData({
          vehiclesCount:        Array.isArray(vD.vehicles) ? vD.vehicles.length : 0,
          appointmentsCount:    Array.isArray(aD) ? aD.length : 0,
          pendingInvoices:      Array.isArray(iD) ? iD.filter(i => i.paymentStatus === 'Pending').length : 0,
          unreadNotifications:  unreadCount,
        });
      } catch (err) {
        console.error('Overview fetch error:', err);
      } finally {
        setOverviewLoading(false);
      }
    };
    fetchOverview();
  }, [user, activeTab]);

  /* Fetch unread count for sidebar badge (always) */
  useEffect(() => {
    if (user.role === 'admin') return;
    fetch('/api/notifications', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setUnread(Array.isArray(d) ? d.filter(n => !n.isRead).length : 0))
      .catch(() => {});
  }, [user]);

  const renderContent = () => {
    switch (activeTab) {
      case 'vehicles':      return <Vehicles      user={user} />;
      case 'appointments':  return <Appointments  user={user} />;
      case 'services':      return <ServiceRecords user={user} />;
      case 'invoices':      return <Invoices      user={user} />;
      case 'technicians':   return <Technicians   user={user} />;
      case 'notifications': return <Notifications user={user} onReadUpdate={setUnread} />;
      case 'admin':         return <AdminPanel    user={user} />;
      case 'overview':
      default:
        if (user.role === 'admin') {
          return (
            <div style={{ textAlign: 'center', paddingTop: '80px', animation: 'fade-in 0.5s ease-out both' }}>
              <div style={{ width: '64px', height: '64px', margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>A</span>
              </div>
              <h3 className="oswald" style={{ fontSize: '2rem', marginBottom: '12px', letterSpacing: '1px' }}>Admin Control Centre</h3>
              <p style={{ color: '#888', marginBottom: '28px', fontSize: '1.1rem' }}>Manage users, metrics and system data.</p>
              <button onClick={() => setActiveTab('admin')} className="angled-button" style={{ padding: '12px 30px', fontSize: '1.05rem' }}>Go to Admin Panel</button>
            </div>
          );
        }
        return <OverviewCards data={overviewData} loading={overviewLoading} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Grid background — fixed so it doesn't scroll away */}
      <div className="grid-overlay" style={{ position: 'fixed', zIndex: 0 }} />

      {/* ── Sidebar ── */}
      <aside className="dashboard-sidebar">
        {/* User info */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
            Logged in as
          </div>
          <div className="oswald" style={{ fontSize: '1.4rem', color: 'var(--primary)', lineHeight: 1.2 }}>
            {user.name}
          </div>
          <div style={{
            marginTop: '6px', display: 'inline-block',
            padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem',
            textTransform: 'uppercase', letterSpacing: '1px',
            background: user.role === 'admin' ? 'rgba(231,76,60,0.18)' : user.role === 'technician' ? 'rgba(52,152,219,0.15)' : 'rgba(255,255,255,0.07)',
            color: user.role === 'admin' ? '#e74c3c' : user.role === 'technician' ? '#3498db' : '#aaa',
          }}>{user.role}</div>
        </div>

        {/* Nav items */}
        <nav style={{ padding: '12px 0' }}>
          {navItems.map((item, i) => (
            <div
              key={item.id}
              className={`nav-item${activeTab === item.id ? ' active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>{ICONS[item.id]}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === 'notifications' && unread > 0 && (
                <span className="notif-badge">{unread > 99 ? '99+' : unread}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Logout at bottom */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          <button className="ghost-button" onClick={onLogout}
            style={{ width: '100%', padding: '10px', fontSize: '0.85rem', textAlign: 'center' }}>
            ↩ Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="dashboard-main" style={{ position: 'relative', zIndex: 2 }}>
        {renderContent()}
      </main>
    </div>
  );
};

/* ── Overview Cards ── */
const CARDS = [
  { key: 'vehiclesCount',       label: 'My Vehicles',     tab: 'vehicles',      btn: 'Manage Vehicles',  alertKey: null },
  { key: 'appointmentsCount',   label: 'Appointments',    tab: 'appointments',  btn: 'View Schedule',    alertKey: null },
  { key: 'pendingInvoices',     label: 'Pending Invoices',tab: 'invoices',      btn: 'View Invoices',    alertKey: 'pendingInvoices' },
  { key: 'unreadNotifications', label: 'New Notices',     tab: 'notifications', btn: 'Check Alerts',     alertKey: 'unreadNotifications' },
];

const OverviewCards = ({ data, loading, setActiveTab }) => (
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
        {CARDS.map(({ key, label, tab, btn, alertKey }) => {
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
              onClick={() => setActiveTab(tab)}
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

export default Dashboard;
