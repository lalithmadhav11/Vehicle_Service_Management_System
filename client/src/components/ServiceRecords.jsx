import React, { useState, useEffect, useCallback } from 'react';

const API = '/api';

const LoadingSpinner = ({ label = 'Loading…' }) => (
  <div className="loading-container"><div className="spinner" /><span>{label}</span></div>
);

const ServiceRecords = ({ user }) => {
  const [records, setRecords]             = useState([]);
  const [appointments, setAppointments]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [searchTerm, setSearchTerm]       = useState('');
  const [filterStatus, setFilterStatus]   = useState('All');
  const [showAddForm, setShowAddForm]     = useState(false);
  const [selectedApt, setSelectedApt]     = useState(null);
  const [formData, setFormData]           = useState({ appointmentId: '', repairDetails: '' });

  const headers = { Authorization: `Bearer ${user.token}` };

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const recRes  = await fetch(`${API}/services`, { headers });
      const recData = await recRes.json();
      if (!recRes.ok) throw new Error(recData.message || 'Failed to fetch service records');
      setRecords(recData || []);

      // Admin needs appointments to create service records from
      if (user.role === 'admin') {
        const aptRes = await fetch(`${API}/appointments`, { headers });
        if (aptRes.ok) {
          const aptData = await aptRes.json();
          // Filter: only appointments with a technician assigned and no existing service record
          const existingAptIds = (recData || []).map(r => r.appointmentId?._id || r.appointmentId).filter(Boolean).map(String);
          const available = (aptData || []).filter(a =>
            a.technicianId &&
            !existingAptIds.includes(a._id) &&
            a.status !== 'Cancelled' &&
            a.status !== 'Completed'
          );
          setAppointments(available);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.token, user.role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAptSelect = (aptId) => {
    setFormData({ ...formData, appointmentId: aptId });
    const apt = appointments.find(a => a._id === aptId);
    setSelectedApt(apt || null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.appointmentId) { setError('Please select an appointment.'); return; }
    if (!formData.repairDetails.trim()) { setError('Please provide repair details.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`${API}/services`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create record');
      setSuccess('Service record created!');
      setShowAddForm(false);
      setFormData({ appointmentId: '', repairDetails: '' });
      setSelectedApt(null);
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
      const res = await fetch(`${API}/services/${id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceStatus }),
      });
      if (res.ok) {
        setSuccess(serviceStatus === 'Completed' ? 'Service completed! Appointment updated.' : 'Status updated.');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const d = await res.json();
        setError(d.message || 'Update failed');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const statusColor = (s) =>
    s === 'Completed'   ? '#2ecc71' :
    s === 'In Progress' ? '#f39c12' : 'var(--primary)';

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
        {user.role === 'admin' && (
          <button onClick={() => { setShowAddForm(!showAddForm); setError(''); }} className="ghost-button">
            {showAddForm ? 'CANCEL' : '+ CREATE FROM APPOINTMENT'}
          </button>
        )}
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ── Admin: Create Service Record from Appointment ── */}
      {showAddForm && user.role === 'admin' && (
        <form onSubmit={handleAddSubmit} style={{
          background: 'var(--surface)', padding: '28px', borderRadius: '6px',
          marginBottom: '28px', border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: '18px',
          animation: 'slideUp 0.3s ease-out both',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
            <div>
              <label style={lbl}>Select Appointment</label>
              <select
                value={formData.appointmentId}
                onChange={e => handleAptSelect(e.target.value)}
                className="input-field" required
              >
                <option value="">— Select Appointment —</option>
                {appointments.map(a => (
                  <option key={a._id} value={a._id}>
                    {a.vehicleId?.model} ({a.vehicleId?.vehicleNumber}) — {a.serviceType} — {new Date(a.appointmentDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Show auto-filled info */}
          {selectedApt && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px', padding: '16px', borderRadius: '4px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
            }}>
              <div>
                <span style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Vehicle</span>
                <div style={{ color: '#fff', fontWeight: 500 }}>{selectedApt.vehicleId?.model} — {selectedApt.vehicleId?.vehicleNumber}</div>
              </div>
              <div>
                <span style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Owner</span>
                <div style={{ color: '#fff', fontWeight: 500 }}>{selectedApt.vehicleId?.userId?.name || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Technician</span>
                <div style={{ color: '#fff', fontWeight: 500 }}>{selectedApt.technicianId?.name || 'Assigned'}</div>
              </div>
              <div>
                <span style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Service Type</span>
                <div style={{ color: 'var(--primary)', fontWeight: 500 }}>{selectedApt.serviceType}</div>
              </div>
            </div>
          )}

          <div>
            <label style={lbl}>Repair Details / Work Description</label>
            <textarea
              value={formData.repairDetails}
              onChange={e => setFormData({ ...formData, repairDetails: e.target.value })}
              className="input-field" placeholder="Describe the work to be done…" rows="3" required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={submitting} className="angled-button" style={{ minWidth: '200px' }}>
              {submitting ? 'Creating…' : 'CREATE SERVICE RECORD'}
            </button>
          </div>
        </form>
      )}

      {/* ── Filters ── */}
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

      {/* ── Records List ── */}
      {loading ? <LoadingSpinner label="Loading service records…" /> : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#555', border: '1px solid rgba(255,255,255,0.08)' }}>S</div>
          <strong style={{ color: '#888' }}>{records.length === 0 ? 'No Service Records Yet' : 'No Results Found'}</strong>
          {records.length === 0 && user.role === 'admin' && <p>Create a service record from a confirmed appointment.</p>}
          {records.length === 0 && user.role === 'technician' && <p>No services assigned to you yet.</p>}
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
                  {rec.vehicleId?.userId?.name && user.role !== 'customer' && (
                    <div style={{ color: '#555', fontSize: '0.78rem', marginTop: '4px' }}>
                      <strong style={{ color: '#777', fontWeight: 500 }}>Owner:</strong> {rec.vehicleId.userId.name}
                    </div>
                  )}
                  {rec.appointmentId && (
                    <div style={{ color: '#555', fontSize: '0.78rem', marginTop: '4px' }}>
                      <strong style={{ color: '#777', fontWeight: 500 }}>Service:</strong> {rec.appointmentId.serviceType || 'N/A'}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Technician and Admin can update status */}
                  {(user.role === 'technician' || user.role === 'admin') ? (
                    <select value={rec.serviceStatus}
                      onChange={e => updateStatus(rec._id, e.target.value)}
                      className="input-field"
                      style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto' }}>
                      {['Pending', 'In Progress', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    /* Customer sees read-only progress */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{
                        padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem',
                        fontWeight: 600, background: 'rgba(255,255,255,0.06)',
                        color: statusColor(rec.serviceStatus),
                      }}>{rec.serviceStatus}</span>
                      {/* Progress bar for customers */}
                      <div style={{ width: '120px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{
                          width: rec.serviceStatus === 'Completed' ? '100%' : rec.serviceStatus === 'In Progress' ? '50%' : '10%',
                          height: '100%', borderRadius: '2px',
                          background: statusColor(rec.serviceStatus),
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
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
