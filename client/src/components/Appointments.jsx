import React, { useState, useEffect, useCallback } from 'react';

const API = '/api';

const LoadingSpinner = ({ label = 'Loading…' }) => (
  <div className="loading-container"><div className="spinner" /><span>{label}</span></div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    Pending:   { bg: 'rgba(243,156,18,0.15)',  color: '#f39c12' },
    Confirmed: { bg: 'rgba(52,152,219,0.15)',  color: '#3498db' },
    Completed: { bg: 'rgba(46,204,113,0.15)',  color: '#2ecc71' },
    Cancelled: { bg: 'rgba(231,76,60,0.15)',   color: '#e74c3c' },
  };
  const s = colors[status] || { bg: 'rgba(255,255,255,0.08)', color: '#888' };
  return (
    <span style={{
      padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem',
      fontWeight: 600, background: s.bg, color: s.color, display: 'inline-block',
    }}>{status}</span>
  );
};

const Appointments = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [showAdd, setShowAdd]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  const [formData, setFormData] = useState({
    vehicleId: '', serviceType: 'Routine Maintenance', appointmentDate: '',
  });

  const headers = { Authorization: `Bearer ${user.token}` };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const appRes  = await fetch(`${API}/appointments`, { headers });
      const appData = await appRes.json();
      if (appRes.ok) setAppointments(appData);
      else throw new Error(appData.message);

      if (user.role === 'customer') {
        const vehRes  = await fetch(`${API}/vehicles`, { headers });
        const vehData = await vehRes.json();
        if (vehRes.ok && vehData.vehicles) {
          setVehicles(vehData.vehicles);
          if (vehData.vehicles.length > 0)
            setFormData(prev => ({ ...prev, vehicleId: vehData.vehicles[0]._id }));
        }
      }
      setError('');
    } catch (err) {
      setError('Failed to load appointments: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user.token, user.role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId) { setError('Please select a vehicle.'); return; }
    if (!formData.appointmentDate) { setError('Please pick a date & time.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`${API}/appointments`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Appointment booked!');
        setShowAdd(false);
        setFormData(prev => ({ ...prev, appointmentDate: '' }));
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Error booking appointment');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/appointments/${id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
      else { const d = await res.json(); setError(d.message); }
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    await updateStatus(id, 'Cancelled');
  };

  return (
    <div style={{ animation: 'fade-in 0.45s ease-out both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="oswald" style={{ fontSize: '2rem', color: '#fff' }}>APPOINTMENTS</h2>
        {user.role === 'customer' && (
          <button onClick={() => { setShowAdd(!showAdd); setError(''); }} className="ghost-button">
            {showAdd ? 'CANCEL' : '+ BOOK APPOINTMENT'}
          </button>
        )}
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showAdd && user.role === 'customer' && (
        <form onSubmit={handleSubmit} style={{
          background: 'var(--surface)', padding: '28px', borderRadius: '6px',
          marginBottom: '28px', border: '1px solid var(--border)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px',
          animation: 'slideUp 0.3s ease-out both',
        }}>
          <div>
            <label style={lbl}>Select Vehicle</label>
            <select className="input-field" value={formData.vehicleId}
              onChange={e => setFormData({ ...formData, vehicleId: e.target.value })} required>
              {vehicles.length === 0
                ? <option value="">No vehicles — add one first</option>
                : vehicles.map(v => <option key={v._id} value={v._id}>{v.model} ({v.vehicleNumber})</option>)
              }
            </select>
          </div>
          <div>
            <label style={lbl}>Service Type</label>
            <select className="input-field" value={formData.serviceType}
              onChange={e => setFormData({ ...formData, serviceType: e.target.value })}>
              {['Routine Maintenance', 'Repair', 'Inspection', 'Oil Change', 'Tyre Service', 'Full Service'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>Date &amp; Time</label>
            <input type="datetime-local" className="input-field" value={formData.appointmentDate}
              min={new Date().toISOString().slice(0, 16)}
              onChange={e => setFormData({ ...formData, appointmentDate: e.target.value })} required />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={submitting} className="angled-button" style={{ width: '100%' }}>
              {submitting ? 'Booking…' : 'CONFIRM BOOKING'}
            </button>
          </div>
        </form>
      )}

      {loading ? <LoadingSpinner label="Loading appointments…" /> : appointments.length === 0 ? (
        <div className="empty-state">
          <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#555', border: '1px solid rgba(255,255,255,0.08)' }}>A</div>
          <strong style={{ color: '#888' }}>No Appointments Found</strong>
          {user.role === 'customer' && <p>Book your first appointment above.</p>}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Vehicle</th>
                {user.role !== 'customer' && <th>Owner</th>}
                <th>Service Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, i) => (
                <tr key={apt._id} style={{ animation: `fade-in 0.35s ease-out ${i * 40}ms both` }}>
                  <td style={{ whiteSpace: 'nowrap', color: '#aaa' }}>{new Date(apt.appointmentDate).toLocaleString()}</td>
                  <td style={{ color: '#fff', fontWeight: 500 }}>{apt.vehicleId?.model || 'N/A'}<br />
                    <span style={{ color: '#666', fontSize: '0.8rem' }}>{apt.vehicleId?.vehicleNumber}</span>
                  </td>
                  {user.role !== 'customer' && <td>{apt.vehicleId?.userId?.name || 'N/A'}</td>}
                  <td>{apt.serviceType}</td>
                  <td><StatusBadge status={apt.status} /></td>
                  <td>
                    {user.role !== 'customer' ? (
                      <select
                        onChange={(e) => updateStatus(apt._id, e.target.value)}
                        value={apt.status}
                        className="input-field"
                        style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto' }}
                      >
                        {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : apt.status === 'Pending' ? (
                      <button className="danger-button" onClick={() => cancelAppointment(apt._id)}>
                        Cancel
                      </button>
                    ) : (
                      <span style={{ color: '#555', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const lbl = {
  display: 'block', marginBottom: '6px', color: '#666',
  fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px',
};

export default Appointments;
