import React, { useState, useEffect } from 'react';

const Invoices = ({ user }) => {
  const [invoices, setInvoices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    totalAmount: '',
    paymentStatus: 'Pending'
  });

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const invRes = await fetch('http://localhost:5000/api/invoices', { headers });
      const invData = await invRes.json();
      
      if (!invRes.ok) throw new Error(invData.message || 'Failed to fetch invoices');
      setInvoices(invData || []);

      if (user.role === 'admin') {
        const vehRes = await fetch('http://localhost:5000/api/vehicles', { headers });
        if (vehRes.ok) {
          const vehData = await vehRes.json();
          setVehicles(vehData.vehicles || []);
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
      const res = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add invoice');
      }
      setShowAddForm(false);
      setFormData({ vehicleId: '', totalAmount: '', paymentStatus: 'Pending' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ animation: 'fade-in 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="oswald" style={{ fontSize: '2.5rem', color: '#fff' }}>INVOICES</h2>
        {user.role === 'admin' && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="ghost-button">
            {showAddForm ? 'CANCEL' : '+ CREATE INVOICE'}
          </button>
        )}
      </div>

      {error && <div style={{ color: '#ff4d4d', marginBottom: '15px' }}>{error}</div>}

      {showAddForm && user.role === 'admin' && (
        <form onSubmit={handleAddSubmit} style={{ background: 'var(--surface)', padding: '30px', borderRadius: '4px', marginBottom: '30px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
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
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Amount ($)</label>
            <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} className="input-field" placeholder="150" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Payment Status</label>
            <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="input-field">
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="angled-button" style={{ width: '100%' }}>SAVE INVOICE</button>
          </div>
        </form>
      )}

      {!loading && invoices.length > 0 && (
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search by vehicle number or model..." 
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
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      )}

      {(() => {
        const filteredInvoices = invoices.filter(inv => {
          const vn = inv.vehicleId?.vehicleNumber?.toLowerCase() || '';
          const m = inv.vehicleId?.model?.toLowerCase() || '';
          const search = searchTerm.toLowerCase();
          const matchesSearch = vn.includes(search) || m.includes(search);
          const matchesStatus = filterStatus === 'All' || inv.paymentStatus === filterStatus;
          return matchesSearch && matchesStatus;
        });

        if (loading) return <p>Loading invoices...</p>;
        
        if (filteredInvoices.length === 0) {
          return (
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: '4px' }}>
              <p style={{ color: '#888' }}>No invoices found matching your criteria.</p>
            </div>
          );
        }

        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredInvoices.map((inv) => (
              <div 
                key={inv._id} 
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
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.5)';
                }} 
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: inv.paymentStatus === 'Paid' ? '#2ecc71' : 'var(--primary)' }}></div>
              <h3 className="oswald" style={{ fontSize: '1.5rem', marginBottom: '5px' }}>${inv.totalAmount}</h3>
              <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '15px' }}>
                Vehicle: {inv.vehicleId?.vehicleNumber || 'Unknown'} <br/>
                Owner: {inv.vehicleId?.userId?.name || 'Unknown'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.9rem' }}>
                <span style={{ color: inv.paymentStatus === 'Paid' ? '#2ecc71' : 'var(--primary)', fontWeight: 'bold' }}>{inv.paymentStatus}</span>
                <span>{new Date(inv.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
};

export default Invoices;
