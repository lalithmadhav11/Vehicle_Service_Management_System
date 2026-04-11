import React, { useState, useEffect } from 'react';

const Vehicles = ({ user }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    model: '',
    fuelType: 'Petrol',
    purchaseYear: new Date().getFullYear().toString()
  });

  const fetchVehicles = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/vehicles', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch vehicles');
      setVehicles(data.vehicles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [user.token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add vehicle');
      }
      setShowAddForm(false);
      setFormData({ vehicleNumber: '', model: '', fuelType: 'Petrol', purchaseYear: '' });
      fetchVehicles();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ animation: 'fade-in 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="oswald" style={{ fontSize: '2.5rem', color: '#fff' }}>MY VEHICLES</h2>
        {user.role === 'customer' || user.role === 'admin' ? (
          <button onClick={() => setShowAddForm(!showAddForm)} className="ghost-button">
            {showAddForm ? 'CANCEL' : '+ ADD VEHICLE'}
          </button>
        ) : null}
      </div>

      {error && <div style={{ color: '#ff4d4d', marginBottom: '15px' }}>{error}</div>}

      {showAddForm && (
        <form onSubmit={handleAddSubmit} style={{ background: 'var(--surface)', padding: '30px', borderRadius: '4px', marginBottom: '30px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Vehicle Number</label>
            <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} className="input-field" placeholder="ABC-1234" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Model</label>
            <input type="text" name="model" value={formData.model} onChange={handleChange} className="input-field" placeholder="Ford Mustang" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Fuel Type</label>
            <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="input-field">
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Purchase Year</label>
            <input type="number" name="purchaseYear" value={formData.purchaseYear} onChange={handleChange} className="input-field" placeholder="2023" required />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="angled-button" style={{ width: '100%' }}>SAVE VEHICLE</button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading vehicles...</p>
      ) : vehicles.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: '4px' }}>
          <p style={{ color: '#888' }}>No vehicles found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {vehicles.map((v) => (
            <div key={v._id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '25px', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }}></div>
              <h3 className="oswald" style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{v.model}</h3>
              <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1.2rem', marginBottom: '15px' }}>{v.vehicleNumber}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.9rem' }}>
                <span>Type: {v.fuelType}</span>
                <span>Year: {v.purchaseYear}</span>
              </div>
              {user.role !== 'customer' && v.userId && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)', fontSize: '0.85rem', color: '#666' }}>
                  Owner: {v.userId.name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vehicles;
