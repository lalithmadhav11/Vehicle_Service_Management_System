import React, { useState, useEffect, useCallback } from 'react';

const API = '/api';

const LoadingSpinner = ({ label = 'Loading…' }) => (
  <div className="loading-container"><div className="spinner" /><span>{label}</span></div>
);

const TYPE_CONFIG = {
  success: { color: '#2ecc71', bg: 'rgba(46,204,113,0.12)', icon: '✓' },
  warning: { color: '#f39c12', bg: 'rgba(243,156,18,0.12)',  icon: '⚠' },
  error:   { color: '#e74c3c', bg: 'rgba(231,76,60,0.12)',   icon: '✕' },
  info:    { color: '#3498db', bg: 'rgba(52,152,219,0.12)',   icon: 'ℹ' },
};

const Notifications = ({ user, onReadUpdate }) => {
  const [notifications, setNotifications] = useState([]);
  const [usersList, setUsersList]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [searchTerm, setSearchTerm]       = useState('');
  const [filterType, setFilterType]       = useState('All');
  const [showAddForm, setShowAddForm]     = useState(false);
  const [formData, setFormData] = useState({ userId: '', title: '', message: '', type: 'info' });

  const headers = { Authorization: `Bearer ${user.token}` };

  const fetchNotifications = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/notifications`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
      const list = data || [];
      setNotifications(list);

      // Bubble unread count to parent (Dashboard badge)
      if (onReadUpdate) {
        onReadUpdate(list.filter(n => !n.isRead).length);
      }

      if (user.role === 'admin') {
        const uRes = await fetch(`${API}/admin/users`, { headers });
        if (uRes.ok) setUsersList(await uRes.json());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.token, user.role]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${API}/notifications/${id}/read`, {
        method: 'PUT', headers,
      });
      if (res.ok) {
        setNotifications(prev => {
          const updated = prev.map(n => n._id === id ? { ...n, isRead: true } : n);
          if (onReadUpdate) onReadUpdate(updated.filter(n => !n.isRead).length);
          return updated;
        });
      }
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markAsRead(n._id)));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId) { setError('Please select a recipient.'); return; }
    setSubmitting(true); setError('');
    try {
      const res  = await fetch(`${API}/notifications`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send notification');
      setSuccess('Notification sent!');
      setShowAddForm(false);
      setFormData({ userId: '', title: '', message: '', type: 'info' });
      fetchNotifications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = notifications.filter(notif => {
    const src = searchTerm.toLowerCase();
    const matchSearch = notif.title?.toLowerCase().includes(src) || notif.message?.toLowerCase().includes(src);
    const matchType = filterType === 'All'
      ? true : filterType === 'Unread' ? !notif.isRead : filterType === 'Read' ? notif.isRead : notif.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div style={{ animation: 'fade-in 0.45s ease-out both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <h2 className="oswald" style={{ fontSize: '2rem', color: '#fff' }}>NOTIFICATIONS</h2>
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="ghost-button" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
              Mark All Read
            </button>
          )}
          {user.role === 'admin' && (
            <button onClick={() => { setShowAddForm(!showAddForm); setError(''); }} className="ghost-button">
              {showAddForm ? 'CANCEL' : '+ SEND NOTICE'}
            </button>
          )}
        </div>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showAddForm && user.role === 'admin' && (
        <form onSubmit={handleAddSubmit} style={{
          background: 'var(--surface)', padding: '28px', borderRadius: '6px',
          marginBottom: '28px', border: '1px solid var(--border)',
          animation: 'slideUp 0.3s ease-out both',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px', marginBottom: '18px' }}>
            <div>
              <label style={lbl}>Recipient</label>
              <select name="userId" value={formData.userId}
                onChange={e => setFormData({ ...formData, userId: e.target.value })}
                className="input-field" required>
                <option value="">— Select User —</option>
                {usersList.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email}) [{u.role}]</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Title</label>
              <input type="text" name="title" value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="input-field" placeholder="Alert title…" required />
            </div>
            <div>
              <label style={lbl}>Type</label>
              <select name="type" value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="input-field">
                {[['info', 'Info'], ['success', 'Success'], ['warning', 'Warning'], ['error', 'Error']].map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={lbl}>Message</label>
            <textarea name="message" value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              className="input-field" placeholder="Notification content…" rows="2" required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={submitting} className="angled-button" style={{ minWidth: '160px' }}>
              {submitting ? 'Sending…' : 'SEND NOTIFICATION'}
            </button>
          </div>
        </form>
      )}

      {!loading && notifications.length > 0 && (
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search notifications…" className="input-field"
            style={{ flex: '1 1 220px' }} value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} />
          <select className="input-field" style={{ flex: '0 0 160px' }} value={filterType}
            onChange={e => setFilterType(e.target.value)}>
            <option value="All">All</option>
            <option value="Unread">Unread</option>
            <option value="Read">Read</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      )}

      {loading ? <LoadingSpinner label="Loading notifications…" /> : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#555', border: '1px solid rgba(255,255,255,0.08)' }}>N</div>
          <strong style={{ color: '#888' }}>{notifications.length === 0 ? 'No Notifications' : 'No Matches'}</strong>
          {notifications.length === 0 && <p>You're all caught up!</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((notif, i) => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
            return (
              <div key={notif._id} style={{
                background: notif.isRead ? 'rgba(255,255,255,0.02)' : cfg.bg,
                border: '1px solid',
                borderColor: notif.isRead ? 'rgba(255,255,255,0.05)' : cfg.color + '55',
                borderLeft: `4px solid ${notif.isRead ? 'rgba(255,255,255,0.1)' : cfg.color}`,
                padding: '16px 20px', borderRadius: '5px',
                opacity: notif.isRead ? 0.6 : 1,
                transition: 'all 0.25s',
                animation: `fade-in 0.35s ease-out ${i * 40}ms both`,
              }}
                onMouseOver={e => { if (!notif.isRead) e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseOut={e  => { e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 }}>
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: cfg.color + '22', color: cfg.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.9rem', flexShrink: 0, marginTop: '1px',
                    }}>{cfg.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px', fontSize: '0.98rem', color: notif.isRead ? '#666' : '#fff', fontWeight: 600 }}>
                        {notif.title}
                      </h4>
                      <p style={{ margin: 0, color: notif.isRead ? '#555' : '#aaa', fontSize: '0.88rem', lineHeight: 1.5 }}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                  {!notif.isRead && (
                    <button onClick={() => markAsRead(notif._id)} style={{
                      background: 'transparent', border: `1px solid ${cfg.color}55`,
                      color: cfg.color, padding: '4px 12px', borderRadius: '4px',
                      cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase',
                      letterSpacing: '0.5px', whiteSpace: 'nowrap', flexShrink: 0,
                      transition: 'all 0.2s',
                    }}
                      onMouseOver={e => { e.currentTarget.style.background = cfg.color + '22'; }}
                      onMouseOut={e  => { e.currentTarget.style.background = 'transparent'; }}
                    >Mark Read</button>
                  )}
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.76rem', color: '#555', paddingLeft: '40px' }}>
                  {new Date(notif.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const lbl = {
  display: 'block', marginBottom: '6px', color: '#666',
  fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px',
};

export default Notifications;
