import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

/* ── nav icon map ── */
const ICONS = {
  '/dashboard':     'O',
  '/vehicles':      'V',
  '/appointments':  'A',
  '/services':      'S',
  '/invoices':      'I',
  '/notifications': 'N',
  '/technicians':   'T',
  '/admin':         'A',
};

const DashboardLayout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  /* Build nav list based on role */
  const navItems = [
    { id: '/dashboard',      label: 'Overview' },
  ];
  // Technicians should not see vehicles or invoices
  if (user.role !== 'technician') {
    navItems.push({ id: '/vehicles', label: 'Vehicles' });
  }
  navItems.push({ id: '/appointments',  label: 'Appointments' });
  navItems.push({ id: '/services',      label: 'Service Records' });
  if (user.role !== 'technician') {
    navItems.push({ id: '/invoices', label: 'Invoices' });
  }
  navItems.push({ id: '/notifications', label: 'Notifications' });
  if (user.role !== 'customer') navItems.push({ id: '/technicians', label: 'Technicians' });
  if (user.role === 'admin')    navItems.push({ id: '/admin',       label: 'Admin Panel' });

  /* Fetch unread count for sidebar badge */
  useEffect(() => {
    if (user.role === 'admin') return;
    
    // We can fetch unread notifications independently of the current route
    fetch('/api/notifications', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setUnread(Array.isArray(d) ? d.filter(n => !n.isRead).length : 0))
      .catch(() => {});
  }, [user, location.pathname]); // re-check on route change

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
              className={`nav-item${location.pathname === item.id || (item.id === '/dashboard' && location.pathname === '/') ? ' active' : ''}`}
              onClick={() => navigate(item.id)}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>{ICONS[item.id]}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === '/notifications' && unread > 0 && (
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
        <Outlet context={{ user, setUnread }} />
      </main>
    </div>
  );
};

export default DashboardLayout;
