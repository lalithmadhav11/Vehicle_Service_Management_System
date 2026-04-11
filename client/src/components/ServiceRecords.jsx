import React, { useState, useEffect } from 'react';

const ServiceRecords = ({ user }) => {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    technicianId: '',
    repairDetails: '',
    serviceStatus: 'Pending'
  });

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const recRes = await fetch('http://localhost:5000/api/services', { headers });
      const recData = await recRes.json();
      
      if (!recRes.ok) throw new Error(recData.message || 'Failed to fetch service records');
      setRecords(recData || []);

      if (user.role !== 'customer') {
        const [vehRes, techRes] = await Promise.all([
          fetch('http://localhost:5000/api/vehicles', { headers }),
          fetch('http://localhost:5000/api/technicians', { headers })
        ]);
        
        if (vehRes.ok) {
          const vehData = await vehRes.json();
          setVehicles(vehData.vehicles || []);
        }
        if (techRes.ok) {
          const techData = await techRes.json();
          setTechnicians(techData || []);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add service record');
      }
      setShowAddForm(false);
      setFormData({ vehicleId: '', technicianId: '', repairDetails: '', serviceStatus: 'Pending' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ animation: 'fade-in 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="oswald" style={{ fontSize: '2.5rem', color: '#fff' }}>SERVICE RECORDS</h2>
        {user.role !== 'customer' && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="ghost-button">
            {showAddForm ? 'CANCEL' : '+ CREATE RECORD'}
          </button>
        )}
      </div>

      {error && <div style={{ color: '#ff4d4d', marginBottom: '15px' }}>{error}</div>}

      {showAddForm && user.role !== 'customer' && (
        <form onSubmit={handleAddSubmit} style={{ background: 'var(--surface)', padding: '30px', borderRadius: '4px', marginBottom: '30px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Select Vehicle</label>
              <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} className="input-field" required>
                <option value="">-- Select Vehicle --</option>
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>{v.vehicleNumber} ({v.model})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Select Technician</label>
              <select name="technicianId" value={formData.technicianId} onChange={handleChange} className="input-field" required>
                <option value="">-- Select Tech --</option>
                {technicians.map(t => (
                  <option key={t._id} value={t._id}>{t.name} ({t.specialization})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</label>
              <select name="serviceStatus" value={formData.serviceStatus} onChange={handleChange} className="input-field">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Repair Details</label>
            <textarea name="repairDetails" value={formData.repairDetails} onChange={handleChange} className="input-field" placeholder="Describe the repairs..." rows="3" required></textarea>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            <button type="submit" className="angled-button" style={{ width: '200px' }}>SAVE RECORD</button>
          </div>
        </form>
      )}

      {!loading && records.length > 0 && (
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search by vehicle, model, or tech name..." 
            className="input-field" 
            style={{ flex: '1 1 300px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="input-field" 
            style={{ flex: '0 0 200px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      )}

      {(() => {
        const filteredRecords = records.filter(rec => {
          const vn = rec.vehicleId?.vehicleNumber?.toLowerCase() || '';
          const m = rec.vehicleId?.model?.toLowerCase() || '';
          const tn = rec.technicianId?.name?.toLowerCase() || '';
          const search = searchTerm.toLowerCase();
          const matchesSearch = vn.includes(search) || m.includes(search) || tn.includes(search);
          const matchesStatus = filterStatus === 'All' || rec.serviceStatus === filterStatus;
          return matchesSearch && matchesStatus;
        });

        if (loading) return <p>Loading records...</p>;
        
        if (filteredRecords.length === 0) {
          return (
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: '4px' }}>
              <p style={{ color: '#888' }}>No service records found matching your criteria.</p>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredRecords.map((rec) => (
              <div 
                key={rec._id} 
                style={{ 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)', 
                  padding: '25px', 
                  borderRadius: '4px', 
                  position: 'relative', 
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  cursor: 'default'
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
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: rec.serviceStatus === 'Completed' ? '#2ecc71' : rec.serviceStatus === 'In Progress' ? '#f39c12' : 'var(--primary)' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h3 className="oswald" style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{rec.vehicleId?.model} ({rec.vehicleId?.vehicleNumber})</h3>
                  <div style={{ color: '#888', fontSize: '0.85rem' }}>Tech: {rec.technicianId?.name}</div>
                </div>
                <span style={{ padding: '5px 10px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', background: 'rgba(255,255,255,0.05)', color: rec.serviceStatus === 'Completed' ? '#2ecc71' : rec.serviceStatus === 'In Progress' ? '#f39c12' : 'var(--primary)' }}>
                  {rec.serviceStatus}
                </span>
              </div>
              <div style={{ color: '#ccc', fontSize: '0.9rem', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                {rec.repairDetails}
              </div>
              <div style={{ marginTop: '15px', fontSize: '0.8rem', color: '#666', textAlign: 'right' }}>
                Created: {new Date(rec.createdAt).toLocaleDateString()}
              </div>
            </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
};

export default ServiceRecords;
