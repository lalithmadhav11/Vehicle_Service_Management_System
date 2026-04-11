import React, { useState, useEffect } from 'react';

const AdminPanel = ({ user }) => {
  const [metrics, setMetrics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role !== 'admin') return;
    
    const fetchAdminData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        
        const metricsRes = await fetch('http://localhost:5000/api/admin/metrics', { headers });
        if (metricsRes.ok) setMetrics(await metricsRes.json());
        
        const usersRes = await fetch('http://localhost:5000/api/admin/users', { headers });
        if (usersRes.ok) setUsersList(await usersRes.json());

      } catch (err) {
        console.error("Admin fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [user]);

  if (user.role !== 'admin') {
    return <div style={{ color: 'red', marginTop: '50px' }}>Access Denied: Admin privileges required.</div>;
  }

  return (
    <div style={{ animation: 'fade-in 0.5s ease-out' }}>
      <h2 className="oswald" style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '30px' }}>ADMIN CONTROL PANEL</h2>
      
      {loading ? <p>Loading system metrics...</p> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: 'var(--surface)', padding: '25px', borderRadius: '4px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ color: '#aaa', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '10px' }}>Total Users</div>
              <div style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 700 }} className="oswald">{metrics?.userCount || 0}</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: '25px', borderRadius: '4px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ color: '#aaa', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '10px' }}>Total Vehicles</div>
              <div style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 700 }} className="oswald">{metrics?.vehicleCount || 0}</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: '25px', borderRadius: '4px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ color: '#aaa', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '10px' }}>Appointments</div>
              <div style={{ fontSize: '2.5rem', color: 'var(--primary)', fontWeight: 700 }} className="oswald">{metrics?.appointmentCount || 0}</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: '25px', borderRadius: '4px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ color: '#aaa', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '10px' }}>Total Revenue</div>
              <div style={{ fontSize: '2.5rem', color: '#2ecc71', fontWeight: 700 }} className="oswald">${metrics?.totalRevenue || 0}</div>
            </div>
          </div>

          <h3 className="oswald" style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '20px' }}>USER DIRECTORY</h3>
          <div style={{ overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '20px' }}>Name</th>
                  <th style={{ padding: '20px' }}>Email</th>
                  <th style={{ padding: '20px' }}>Role</th>
                  <th style={{ padding: '20px' }}>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u._id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '20px', color: '#fff' }}>{u.name}</td>
                    <td style={{ padding: '20px' }}>{u.email}</td>
                    <td style={{ padding: '20px' }}>
                      <span style={{ padding: '5px 10px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', background: u.role === 'admin' ? 'rgba(231, 76, 60, 0.2)' : u.role === 'technician' ? 'rgba(52, 152, 219, 0.2)' : 'rgba(255,255,255,0.1)', color: u.role === 'admin' ? '#e74c3c' : u.role === 'technician' ? '#3498db' : '#aaa' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '20px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
