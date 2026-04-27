import React, { useState, useEffect, useCallback } from 'react';

const API = '/api';

const LoadingSpinner = ({ label = 'Loading…' }) => (
  <div className="loading-container"><div className="spinner" /><span>{label}</span></div>
);

const PayBadge = ({ status }) => {
  const map = {
    Paid:      { bg: 'rgba(46,204,113,0.15)', color: '#2ecc71' },
    Pending:   { bg: 'rgba(231,76,60,0.15)',  color: '#e74c3c' },
    Cancelled: { bg: 'rgba(255,255,255,0.06)', color: '#888' },
  };
  const s = map[status] || map.Cancelled;
  return (
    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

const Invoices = ({ user }) => {
  const [invoices, setInvoices]     = useState([]);
  const [vehicles, setVehicles]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [formData, setFormData] = useState({ vehicleId: '', totalAmount: '', paymentStatus: 'Pending' });

  const headers = { Authorization: `Bearer ${user.token}` };

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const invRes  = await fetch(`${API}/invoices`, { headers });
      const invData = await invRes.json();
      if (!invRes.ok) throw new Error(invData.message || 'Failed to fetch invoices');
      setInvoices(invData || []);

      if (user.role === 'admin') {
        const vehRes  = await fetch(`${API}/vehicles`, { headers });
        if (vehRes.ok) { const vd = await vehRes.json(); setVehicles(vd.vehicles || []); }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.token, user.role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId) { setError('Please select a vehicle.'); return; }
    setSubmitting(true); setError('');
    try {
      const res  = await fetch(`${API}/invoices`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, totalAmount: Number(formData.totalAmount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create invoice');
      setSuccess('Invoice created!');
      setShowAddForm(false);
      setFormData({ vehicleId: '', totalAmount: '', paymentStatus: 'Pending' });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      const res  = await fetch(`${API}/invoices/${id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) {
        setInvoices(prev => prev.map(inv => inv._id === id ? { ...inv, paymentStatus } : inv));
      } else {
        const d = await res.json();
        setError(d.message || 'Failed to update invoice');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = invoices.filter(inv => {
    const vn     = inv.vehicleId?.vehicleNumber?.toLowerCase() || '';
    const m      = inv.vehicleId?.model?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return (vn.includes(search) || m.includes(search)) &&
           (filterStatus === 'All' || inv.paymentStatus === filterStatus);
  });

  return (
    <div style={{ animation: 'fade-in 0.45s ease-out both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="oswald" style={{ fontSize: '2rem', color: '#fff' }}>INVOICES</h2>
        {user.role === 'admin' && (
          <button onClick={() => { setShowAddForm(!showAddForm); setError(''); }} className="ghost-button">
            {showAddForm ? 'CANCEL' : '+ CREATE INVOICE'}
          </button>
        )}
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showAddForm && user.role === 'admin' && (
        <form onSubmit={handleAddSubmit} style={{
          background: 'var(--surface)', padding: '28px', borderRadius: '6px',
          marginBottom: '28px', border: '1px solid var(--border)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px',
          animation: 'slideUp 0.3s ease-out both',
        }}>
          <div>
            <label style={lbl}>Select Vehicle</label>
            <select name="vehicleId" value={formData.vehicleId}
              onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
              className="input-field" required>
              <option value="">— Select Vehicle —</option>
              {vehicles.map(v => <option key={v._id} value={v._id}>{v.vehicleNumber} ({v.model})</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Total Amount (₹)</label>
            <input type="number" name="totalAmount" value={formData.totalAmount} min="1"
              onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
              className="input-field" placeholder="1500" required />
          </div>
          <div>
            <label style={lbl}>Payment Status</label>
            <select name="paymentStatus" value={formData.paymentStatus}
              onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
              className="input-field">
              {['Pending', 'Paid', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={submitting} className="angled-button" style={{ width: '100%' }}>
              {submitting ? 'Saving…' : 'SAVE INVOICE'}
            </button>
          </div>
        </form>
      )}

      {!loading && invoices.length > 0 && (
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search by vehicle…" className="input-field"
            style={{ flex: '1 1 220px' }} value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} />
          <select className="input-field" style={{ flex: '0 0 160px' }} value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            {['Pending', 'Paid', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {loading ? <LoadingSpinner label="Loading invoices…" /> : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#555', border: '1px solid rgba(255,255,255,0.08)' }}>I</div>
          <strong style={{ color: '#888' }}>{invoices.length === 0 ? 'No Invoices Yet' : 'No Results Found'}</strong>
          {invoices.length === 0 && user.role === 'admin' && <p>Create the first invoice above.</p>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '18px' }}>
          {filtered.map((inv, i) => (
            <div key={inv._id} className="hover-card" style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              padding: '24px', borderRadius: '6px', position: 'relative', overflow: 'hidden',
              animation: `fade-in 0.4s ease-out ${i * 60}ms both`,
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
                background: inv.paymentStatus === 'Paid' ? '#2ecc71' : inv.paymentStatus === 'Cancelled' ? '#888' : 'var(--primary)',
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 className="oswald" style={{ fontSize: '1.6rem' }}>
                  ₹{inv.totalAmount?.toLocaleString()}
                </h3>
                <PayBadge status={inv.paymentStatus} />
              </div>
              <p style={{ color: '#aaa', fontSize: '0.88rem', marginBottom: '14px' }}>
                <strong style={{ color: '#777', fontWeight: 500 }}>Vehicle:</strong> {inv.vehicleId?.vehicleNumber || 'Unknown'} — {inv.vehicleId?.model}<br />
                <strong style={{ color: '#777', fontWeight: 500 }}>Owner:</strong> {inv.vehicleId?.userId?.name || 'Unknown'}
              </p>
              <p style={{ color: '#555', fontSize: '0.78rem', marginBottom: '14px' }}>
                {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              {user.role === 'admin' && inv.paymentStatus !== 'Paid' && (
                <button
                  className="angled-button"
                  style={{ width: '100%', padding: '9px', fontSize: '0.82rem' }}
                  onClick={() => updatePaymentStatus(inv._id, inv.paymentStatus === 'Pending' ? 'Paid' : 'Pending')}
                >
                  {inv.paymentStatus === 'Pending' ? 'Mark as Paid' : 'Mark as Pending'}
                </button>
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

export default Invoices;
