import React, { useState, useEffect } from 'react';

const API = '/api';

/* ─── Helpers ─── */
const LoadingSpinner = ({ label = 'Loading…' }) => (
  <div className="loading-container">
    <div className="spinner" />
    <span>{label}</span>
  </div>
);

const EmptyState = ({ icon = '📋', title = 'Nothing here yet', sub = '' }) => (
  <div className="empty-state">
    <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#555', border: '1px solid rgba(255,255,255,0.08)' }}>V</div>
    <strong style={{ color: '#888', fontSize: '1rem' }}>{title}</strong>
    {sub && <p>{sub}</p>}
  </div>
);

const Vehicles = ({ user }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '', model: '', fuelType: 'Petrol',
    purchaseYear: new Date().getFullYear().toString(),
  });

  const headers = { Authorization: `Bearer ${user.token}` };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/vehicles`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch vehicles');
      setVehicles(data.vehicles || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, [user.token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const vNum = formData.vehicleNumber.replace(/\s+/g, '').toUpperCase();
    if (!/^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{4}$/.test(vNum) && !/^[A-Z0-9]{5,10}$/.test(vNum)) {
      setError('Invalid Vehicle Number. Format should be like MH12AB1234.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/vehicles`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add vehicle');
      setShowAddForm(false);
      setFormData({ vehicleNumber: '', model: '', fuelType: 'Petrol', purchaseYear: new Date().getFullYear().toString() });
      fetchVehicles();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this vehicle? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API}/vehicles/${id}`, { method: 'DELETE', headers });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setVehicles(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const canAdd = user.role === 'customer';

  return (
    <div style={{ animation: 'fade-in 0.45s ease-out both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="oswald" style={{ fontSize: '2rem', color: '#fff' }}>MY VEHICLES</h2>
        {canAdd && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="ghost-button">
            {showAddForm ? 'CANCEL' : '+ ADD VEHICLE'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showAddForm && canAdd && (
        <form onSubmit={handleAddSubmit} style={{
          background: 'var(--surface)', padding: '28px', borderRadius: '6px',
          marginBottom: '28px', border: '1px solid var(--border)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px',
          animation: 'slideUp 0.3s ease-out both',
        }}>
          <div>
            <label style={lbl}>Vehicle Number</label>
            <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange}
              className="input-field" placeholder="MH12AB1234" required />
          </div>
          <div>
            <label style={lbl}>Model / Brand</label>
            <input type="text" name="model" value={formData.model} onChange={handleChange}
              className="input-field" placeholder="Honda City" required />
          </div>
          <div>
            <label style={lbl}>Fuel Type</label>
            <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="input-field">
              {['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>Purchase Year</label>
            <input type="number" name="purchaseYear" value={formData.purchaseYear} onChange={handleChange}
              className="input-field" min="1990" max={new Date().getFullYear()} required />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={submitting} className="angled-button" style={{ width: '100%' }}>
              {submitting ? 'Saving…' : 'SAVE VEHICLE'}
            </button>
          </div>
        </form>
      )}

      {loading ? <LoadingSpinner label="Loading vehicles…" /> : vehicles.length === 0 ? (
        <EmptyState title="No vehicles yet" sub={canAdd ? 'Add your first vehicle to get started.' : 'No vehicles registered.'} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {vehicles.map((v, i) => (
            <div key={v._id} className="hover-card" style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              padding: '24px', borderRadius: '6px', position: 'relative', overflow: 'hidden',
              animation: `fade-in 0.4s ease-out ${i * 60}ms both`,
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 className="oswald" style={{ fontSize: '1.4rem' }}>{v.model}</h3>
                {(user.role === 'admin' || (user.role === 'customer' && v.userId?._id === user._id || v.userId === user._id)) && (
                  <button className="danger-button" onClick={() => handleDelete(v._id)}>Delete</button>
                )}
              </div>
              <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '14px' }}>
                {v.vehicleNumber}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.88rem' }}>
                <span><strong style={{ color: '#aaa', fontWeight: 500 }}>Fuel:</strong> {v.fuelType}</span>
                <span><strong style={{ color: '#aaa', fontWeight: 500 }}>Year:</strong> {v.purchaseYear}</span>
              </div>
              {user.role !== 'customer' && v.userId && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)', fontSize: '0.83rem', color: '#888' }}>
                  <strong style={{ color: '#aaa', fontWeight: 500 }}>Owner:</strong> <span style={{ color: '#fff' }}>{v.userId.name}</span>
                </div>
              )}
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

export default Vehicles;
