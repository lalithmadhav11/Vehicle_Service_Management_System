import React, { useState, useEffect } from 'react';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'info'
  });

  const fetchNotifications = async () => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const res = await fetch('http://localhost:5000/api/notifications', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
      setNotifications(data || []);

      if (user.role === 'admin') {
        const userRes = await fetch('http://localhost:5000/api/admin/users', { headers });
        if (userRes.ok) {
          const ud = await userRes.json();
          setUsersList(ud);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user.token]);

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send notification');
      }
      setShowAddForm(false);
      setFormData({ userId: '', title: '', message: '', type: 'info' });
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ animation: 'fade-in 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="oswald" style={{ fontSize: '2.5rem', color: '#fff' }}>NOTIFICATIONS</h2>
        {user.role === 'admin' && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="ghost-button">
            {showAddForm ? 'CANCEL' : '+ SEND NOTIFICATION'}
          </button>
        )}
      </div>

      {error && <div style={{ color: '#ff4d4d', marginBottom: '15px' }}>{error}</div>}

      {showAddForm && user.role === 'admin' && (
        <form onSubmit={handleAddSubmit} style={{ background: 'var(--surface)', padding: '30px', borderRadius: '4px', marginBottom: '30px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Recipient User</label>
              <select name="userId" value={formData.userId} onChange={handleChange} className="input-field" required>
                <option value="">-- Select User --</option>
                {usersList.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="Alert title" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="input-field">
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Message</label>
            <textarea name="message" value={formData.message} onChange={handleChange} className="input-field" placeholder="Notification content..." rows="2" required></textarea>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="angled-button" style={{ width: '200px' }}>SEND</button>
          </div>
        </form>
      )}

      {!loading && notifications.length > 0 && (
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search notices by title or message..." 
            className="input-field" 
            style={{ flex: '1 1 300px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="input-field" 
            style={{ flex: '0 0 200px' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Notices</option>
            <option value="Unread">Unread Only</option>
            <option value="Read">Read Only</option>
          </select>
        </div>
      )}

      {(() => {
        const filteredNotifications = notifications.filter(notif => {
          const titleMatches = notif.title?.toLowerCase().includes(searchTerm.toLowerCase());
          const messageMatches = notif.message?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesSearch = titleMatches || messageMatches;
          
          let matchesType = true;
          if (filterType === 'Unread') matchesType = !notif.isRead;
          if (filterType === 'Read') matchesType = notif.isRead;

          return matchesSearch && matchesType;
        });

        if (loading) return <p>Loading notifications...</p>;
        
        if (filteredNotifications.length === 0) {
          return (
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: '4px' }}>
              <p style={{ color: '#888' }}>No notifications found matching your criteria.</p>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredNotifications.map((notif) => (
              <div 
                key={notif._id} 
                style={{ 
                  background: notif.isRead ? 'rgba(255,255,255,0.02)' : 'var(--surface)', 
                  border: '1px solid',
                  borderColor: notif.isRead ? 'transparent' : 'var(--border)',
                  padding: '20px', 
                  borderRadius: '4px',
                  borderLeft: notif.isRead ? '4px solid transparent' : `4px solid ${
                    notif.type === 'error' ? '#e74c3c' : 
                    notif.type === 'warning' ? '#f39c12' : 
                    notif.type === 'success' ? '#2ecc71' : 'var(--primary)'
                  }`,
                  opacity: notif.isRead ? 0.7 : 1,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
                }} 
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#fff' }}>{notif.title}</h4>
                  <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <button onClick={() => markAsRead(notif._id)} style={{
                    background: 'transparent',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase'
                  }}>Mark Read</button>
                )}
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#666' }}>
                {new Date(notif.createdAt).toLocaleString()}
              </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
};

export default Notifications;
