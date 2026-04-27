import React, { useState, useEffect, useCallback } from 'react';

const API = '/api';

const LoadingSpinner = ({ label = 'Loading…' }) => (
  <div className="loading-container"><div className="spinner" /><span>{label}</span></div>
);

const ServiceRecords = ({ user }) => {
  const [records, setRecords]         = useState([]);
  const [vehicles, setVehicles]       = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '', technicianId: '', repairDetails: '', serviceStatus: 'Pending',
  });

  const headers = { Authorization: `Bearer ${user.token}` };

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const recRes  = await fetch(`${API}/services`, { headers });
      const recData = await recRes.json();
      if (!recRes.ok) throw new Error(recData.message || 'Failed to fetch service records');
      setRecords(recData || []);

      if (user.role !== 'customer') {
        const [vR, tR] = await Promise.all([
          fetch(`${API}/vehicles`, { headers }),
          fetch(`${API}/technicians`, { headers }),
        ]);
        if (vR.ok) { const vd = await vR.json(); setVehicles(vd.vehicles || []); }
        if (tR.ok) { const td = await tR.json(); setTechnicians(td || []); }
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
    setSubmitting(true); setError('');
    try {
      const res  = await fetch(`${API}/services`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create record');
      setSuccess('Service record created!');
      setShowAddForm(false);
      setFormData({ vehicleId: '', technicianId: '', repairDetails: '', serviceStatus: 'Pending' });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, serviceStatus) => {
    try {
      const res  = await fetch(`${API}/services/${id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceStatus }),
      });
      if (res.ok) {
        setRecords(prev => prev.map(r => r._id === id ? { ...r, serviceStatus } : r));
      } else {
        const d = await res.json();
        setError(d.message || 'Update failed');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const statusColor = (s) =>
    s === 'Completed'  ? '#2ecc71' :
    s === 'In Progress'? '#f39c12' : 'var(--primary)';

  const filtered = records.filter(rec => {
    const vn  = rec.vehicleId?.vehicleNumber?.toLowerCase() || '';
    const m   = rec.vehicleId?.model?.toLowerCase() || '';
    const tn  = rec.technicianId?.name?.toLowerCase() || '';
    const src = searchTerm.toLowerCase();
    return (vn.includes(src) || m.includes(src) || tn.includes(src)) &&
           (filterStatus === 'All' || rec.serviceStatus === filterStatus);
  });

  return (
    <div style={{ animation: 'fade-in 0.45s ease-out both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="oswald" style={{ fontSize: '2rem', color: '#fff' }}>SERVICE RECORDS</h2>
        {user.role !== 'customer' && (
          <button onClick={() => { setShowAddForm(!showAddForm); setError(''); }} className="ghost-button">
            {showAddForm ? 'CANCEL' : '+ CREATE RECORD'}
          </button>
        )}
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showAddForm && user.role !== 'customer' && (
        <form onSubmit={handleAddSubmit} style={{
          background: 'var(--surface)', padding: '28px', borderRadius: '6px',
          marginBottom: '28px', border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: '18px',
          animation: 'slideUp 0.3s ease-out both',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px' }}>
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
              <label style={lbl}>Assign Technician</label>
              <select name="technicianId" value={formData.technicianId}
                onChange={e => setFormData({ ...formData, technicianId: e.target.value })}
                className="input-field" required>
                <option value="">— Select Technician —</option>
                {technicians.map(t => <option key={t._id} value={t._id}>{t.name} — {t.specialization}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select name="serviceStatus" value={formData.serviceStatus}
                onChange={e => setFormData({ ...formData, serviceStatus: e.target.value })}
                className="input-field">
                {['Pending', 'In Progress', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Repair Details</label>
            <textarea name="repairDetails" value={formData.repairDetails}
              onChange={e => setFormData({ ...formData, repairDetails: e.target.value })}
              className="input-field" placeholder="Describe the repairs performed…" rows="3" required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={submitting} className="angled-button" style={{ minWidth: '180px' }}>
              {submitting ? 'Saving…' : 'SAVE RECORD'}
            </button>
          </div>
        </form>
      )}

      {!loading && records.length > 0 && (
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search by vehicle, model, technician…"
            className="input-field" style={{ flex: '1 1 220px' }} value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} />
          <select className="input-field" style={{ flex: '0 0 160px' }} value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            {['Pending', 'In Progress', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {loading ? <LoadingSpinner label="Loading service records…" /> : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#555', border: '1px solid rgba(255,255,255,0.08)' }}>S</div>
          <strong style={{ color: '#888' }}>{records.length === 0 ? 'No Service Records Yet' : 'No Results Found'}</strong>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((rec, i) => (
            <div key={rec._id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              padding: '22px', borderRadius: '6px', position: 'relative', overflow: 'hidden',
              transition: 'transform 0.25s, box-shadow 0.25s',
              animation: `fade-in 0.35s ease-out ${i * 50}ms both`,
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'; }}
              onMouseOut={e  => { e.currentTarget.style.transform = 'translateX(0)';   e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: statusColor(rec.serviceStatus) }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 className="oswald" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
                    {rec.vehicleId?.model} — <span style={{ color: '#aaa' }}>{rec.vehicleId?.vehicleNumber}</span>
                  </h3>
                  <div style={{ color: '#666', fontSize: '0.83rem' }}>
                    <strong style={{ color: '#888', fontWeight: 500 }}>Tech:</strong> {rec.technicianId?.name} <span style={{ color: '#444' }}>({rec.technicianId?.specialization})</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {user.role !== 'customer' ? (
                    <select value={rec.serviceStatus}
                      onChange={e => updateStatus(rec._id, e.target.value)}
                      className="input-field"
                      style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto' }}>
                      {['Pending', 'In Progress', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem',
                      fontWeight: 600, background: 'rgba(255,255,255,0.06)',
                      color: statusColor(rec.serviceStatus),
                    }}>{rec.serviceStatus}</span>
                  )}
                </div>
              </div>
              <div style={{ color: '#ccc', fontSize: '0.9rem', padding: '12px 16px', background: 'rgba(0,0,0,0.25)', borderRadius: '4px', lineHeight: 1.6 }}>
                {rec.repairDetails}
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#555', textAlign: 'right' }}>
                Created: {new Date(rec.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
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

export default ServiceRecords;
