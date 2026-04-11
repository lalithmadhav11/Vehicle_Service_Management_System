import React, { useState, useEffect } from 'react';

const Appointments = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: 'Routine Maintenance',
    appointmentDate: ''
  });

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      
      const appRes = await fetch('http://localhost:5000/api/appointments', { headers });
      const appData = await appRes.json();
      
      if (appRes.ok) setAppointments(appData);

      if (user.role === 'customer') {
        const vehRes = await fetch('http://localhost:5000/api/vehicles', { headers });
        const vehData = await vehRes.json();
        if (vehRes.ok && vehData.vehicles) {
           setVehicles(vehData.vehicles);
           if(vehData.vehicles.length > 0) {
              setFormData(prev => ({...prev, vehicleId: vehData.vehicles[0]._id}));
           }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.vehicleId) return alert("Please add a vehicle first!");
    
    try {
      const res = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAdd(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Error booking appointment');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status })
      });
      if(res.ok) fetchData();
    } catch(err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#f39c12';
      case 'Confirmed': return '#3498db';
      case 'Completed': return '#2ecc71';
      case 'Cancelled': return '#e74c3c';
      default: return '#888';
    }
  };

  return (
    <div style={{ animation: 'fade-in 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="oswald" style={{ fontSize: '2.5rem', color: '#fff' }}>APPOINTMENTS</h2>
        {user.role === 'customer' && (
          <button onClick={() => setShowAdd(!showAdd)} className="ghost-button">
            {showAdd ? 'CANCEL' : '+ BOOK APPOINTMENT'}
          </button>
        )}
      </div>

      {error && <div style={{ color: '#ff4d4d', marginBottom: '15px' }}>{error}</div>}
      {showAdd && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', padding: '30px', borderRadius: '4px', marginBottom: '30px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
             <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Select Vehicle</label>
             <select className="input-field" value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})} required>
                {vehicles.length === 0 && <option value="">No vehicles found - please add one</option>}
                {vehicles.map(v => <option key={v._id} value={v._id}>{v.model} ({v.vehicleNumber})</option>)}
             </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Service Type</label>
            <select className="input-field" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} required>
              <option value="Routine Maintenance">Routine Maintenance</option>
              <option value="Repair">Repair</option>
              <option value="Inspection">Inspection</option>
              <option value="Oil Change">Oil Change</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date & Time</label>
            <input type="datetime-local" className="input-field" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} required />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="angled-button" style={{ width: '100%' }}>CONFIRM BOOKING</button>
          </div>
        </form>
      )}

      {loading ? <p>Loading...</p> : (
        <div style={{ overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '20px' }}>Date</th>
                <th style={{ padding: '20px' }}>Vehicle</th>
                {user.role !== 'customer' && <th style={{ padding: '20px' }}>Owner</th>}
                <th style={{ padding: '20px' }}>Service Type</th>
                <th style={{ padding: '20px' }}>Status</th>
                {user.role !== 'customer' && <th style={{ padding: '20px' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#666' }}>No appointments found.</td></tr>
              ) : appointments.map(apt => (
                <tr key={apt._id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '20px' }}>{new Date(apt.appointmentDate).toLocaleString()}</td>
                  <td style={{ padding: '20px', color: '#fff' }}>{apt.vehicleId ? apt.vehicleId.model : 'N/A'}</td>
                  {user.role !== 'customer' && <td style={{ padding: '20px' }}>{apt.vehicleId?.userId?.name || 'N/A'}</td>}
                  <td style={{ padding: '20px' }}>{apt.serviceType}</td>
                  <td style={{ padding: '20px' }}>
                    <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(255,255,255,0.1)', color: getStatusColor(apt.status) }}>
                      {apt.status}
                    </span>
                  </td>
                  {user.role !== 'customer' && (
                    <td style={{ padding: '20px' }}>
                      <select onChange={(e) => updateStatus(apt._id, e.target.value)} value={apt.status} className="input-field" style={{ padding: '8px', fontSize: '0.85rem' }}>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Appointments;
