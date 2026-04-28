import React, { useState, useEffect, useCallback } from 'react';

const API = '/api';

const LoadingSpinner = ({ label = 'Loading…' }) => (
  <div className="loading-container"><div className="spinner" /><span>{label}</span></div>
);

const PayBadge = ({ status }) => {
  const map = {
    Paid:      { bg: 'rgba(46,204,113,0.15)', color: '#2ecc71' },
    Pending:   { bg: 'rgba(231,76,60,0.15)',  color: '#e74c3c' },
    Failed:    { bg: 'rgba(255,255,255,0.06)', color: '#888' },
  };
  const s = map[status] || map.Failed;
  return (
    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

const ApprovalBadge = ({ status }) => {
  const map = {
    'Pending Approval': { bg: 'rgba(243,156,18,0.15)', color: '#f39c12' },
    'Approved':         { bg: 'rgba(46,204,113,0.15)',  color: '#2ecc71' },
    'Rejected':         { bg: 'rgba(231,76,60,0.15)',   color: '#e74c3c' },
  };
  const s = map[status] || map['Pending Approval'];
  return (
    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

const Invoices = ({ user }) => {
  const [invoices, setInvoices]         = useState([]);
  const [vehicles, setVehicles]         = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [showAddForm, setShowAddForm]   = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form state for itemized invoice
  const [selectedAptId, setSelectedAptId] = useState('');
  const [items, setItems] = useState([{ description: '', amount: '', isOptional: false }]);

  const headers = { Authorization: `Bearer ${user.token}` };

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const invRes  = await fetch(`${API}/invoices`, { headers });
      const invData = await invRes.json();
      if (!invRes.ok) throw new Error(invData.message || 'Failed to fetch invoices');
      const enhancedData = (invData || []).map(inv => ({
        ...inv,
        items: inv.items?.map(i => ({ ...i, selected: true })) || []
      }));
      setInvoices(enhancedData);

      if (user.role === 'admin') {
        // Fetch appointments that have a technician assigned
        const aptRes = await fetch(`${API}/appointments`, { headers });
        if (aptRes.ok) {
          const aptData = await aptRes.json();
          // Filter: only those without an existing invoice
          const existingAptIds = (invData || []).map(i => i.appointmentId?._id || i.appointmentId).filter(Boolean).map(String);
          const available = (aptData || []).filter(a =>
            a.technicianId &&
            !existingAptIds.includes(a._id) &&
            a.status !== 'Cancelled'
          );
          setAppointments(available);
        }

        const vehRes = await fetch(`${API}/vehicles`, { headers });
        if (vehRes.ok) { const vd = await vehRes.json(); setVehicles(vd.vehicles || []); }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.token, user.role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Item management
  const addItem = () => setItems([...items, { description: '', amount: '', isOptional: false }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: field === 'isOptional' ? value : value };
    setItems(updated);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAptId) { setError('Please select an appointment.'); return; }
    const validItems = items.filter(i => i.description.trim() && Number(i.amount) > 0);
    if (validItems.length === 0) { setError('Please add at least one item with description and amount.'); return; }
    setSubmitting(true); setError('');
    try {
      const apt = appointments.find(a => a._id === selectedAptId);
      const res = await fetch(`${API}/invoices`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: apt?.vehicleId?._id || apt?.vehicleId,
          appointmentId: selectedAptId,
          items: validItems.map(i => ({ description: i.description, amount: Number(i.amount), isOptional: i.isOptional })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create invoice');
      setSuccess('Invoice created and sent to customer for approval!');
      setShowAddForm(false);
      setSelectedAptId('');
      setItems([{ description: '', amount: '', isOptional: false }]);
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleItem = (invoiceId, itemIdx, isSelected) => {
    setInvoices(prev => prev.map(inv => {
      if (inv._id === invoiceId) {
        const newItems = [...inv.items];
        newItems[itemIdx] = { ...newItems[itemIdx], selected: isSelected };
        return { ...inv, items: newItems };
      }
      return inv;
    }));
  };

  const handleApprove = async (id) => {
    const inv = invoices.find(i => i._id === id);
    const approvedItems = inv.items.filter(i => i.selected !== false).map(i => ({ description: i.description, amount: i.amount, isOptional: i.isOptional }));
    try {
      const res = await fetch(`${API}/invoices/${id}/approve`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: approvedItems }),
      });
      if (res.ok) {
        setSuccess('Invoice approved! Service will begin.');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const d = await res.json();
        setError(d.message || 'Failed to approve');
      }
    } catch (err) { setError(err.message); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Rejecting this invoice will cancel the appointment. Continue?')) return;
    try {
      const res = await fetch(`${API}/invoices/${id}/reject`, {
        method: 'PUT', headers,
      });
      if (res.ok) {
        setSuccess('Invoice rejected. Appointment cancelled.');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const d = await res.json();
        setError(d.message || 'Failed to reject');
      }
    } catch (err) { setError(err.message); }
  };

  const handlePay = async (id) => {
    try {
      const res = await fetch(`${API}/invoices/${id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'Paid' }),
      });
      if (res.ok) {
        setSuccess('Payment successful!');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const d = await res.json();
        setError(d.message || 'Payment failed');
      }
    } catch (err) { setError(err.message); }
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      const res = await fetch(`${API}/invoices/${id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) {
        setInvoices(prev => prev.map(inv => inv._id === id ? { ...inv, paymentStatus } : inv));
      } else {
        const d = await res.json();
        setError(d.message || 'Failed to update');
      }
    } catch (err) { setError(err.message); }
  };

  const totalOfItems = (itemsArr) => (itemsArr || []).reduce((s, i) => s + (i.amount || 0), 0);

  const filtered = invoices.filter(inv => {
    const vn     = inv.vehicleId?.vehicleNumber?.toLowerCase() || '';
    const m      = inv.vehicleId?.model?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return (vn.includes(search) || m.includes(search)) &&
           (filterStatus === 'All' || inv.paymentStatus === filterStatus);
  });

  const selectedApt = appointments.find(a => a._id === selectedAptId);

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

      {/* ── Admin: Create Itemized Invoice ── */}
      {showAddForm && user.role === 'admin' && (
        <form onSubmit={handleAddSubmit} style={{
          background: 'var(--surface)', padding: '28px', borderRadius: '6px',
          marginBottom: '28px', border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: '18px',
          animation: 'slideUp 0.3s ease-out both',
        }}>
          {/* Appointment selector */}
          <div>
            <label style={lbl}>Select Appointment</label>
            <select value={selectedAptId} onChange={e => setSelectedAptId(e.target.value)}
              className="input-field" required>
              <option value="">— Select Appointment —</option>
              {appointments.map(a => (
                <option key={a._id} value={a._id}>
                  {a.vehicleId?.model} ({a.vehicleId?.vehicleNumber}) — {a.serviceType} — {new Date(a.appointmentDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {selectedApt && (
            <div style={{
              padding: '14px 16px', borderRadius: '4px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              fontSize: '0.85rem', color: '#aaa',
            }}>
              <strong style={{ color: '#fff' }}>{selectedApt.vehicleId?.model}</strong> — {selectedApt.vehicleId?.vehicleNumber}
              <span style={{ margin: '0 10px', color: '#444' }}>|</span>
              Owner: <strong style={{ color: '#fff' }}>{selectedApt.vehicleId?.userId?.name || 'N/A'}</strong>
            </div>
          )}

          {/* Itemized cost breakdown */}
          <div>
            <label style={{ ...lbl, marginBottom: '12px' }}>Cost Breakdown</label>
            {items.map((item, idx) => (
              <div key={idx} style={{
                display: 'grid', gridTemplateColumns: '1fr 120px auto auto',
                gap: '10px', marginBottom: '10px', alignItems: 'center',
              }}>
                <input type="text" placeholder="Description (e.g. Oil Change)" className="input-field"
                  value={item.description}
                  onChange={e => updateItem(idx, 'description', e.target.value)} required />
                <input type="number" placeholder="₹ Amount" className="input-field" min="1"
                  value={item.amount}
                  onChange={e => updateItem(idx, 'amount', e.target.value)} required />
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  color: item.isOptional ? '#f39c12' : '#2ecc71',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  padding: '6px 12px', borderRadius: '4px',
                  background: item.isOptional ? 'rgba(243,156,18,0.1)' : 'rgba(46,204,113,0.1)',
                  border: `1px solid ${item.isOptional ? 'rgba(243,156,18,0.3)' : 'rgba(46,204,113,0.3)'}`,
                  whiteSpace: 'nowrap',
                }}>
                  <input type="checkbox" checked={item.isOptional}
                    onChange={e => updateItem(idx, 'isOptional', e.target.checked)}
                    style={{ accentColor: '#f39c12' }} />
                  {item.isOptional ? 'Optional' : 'Necessary'}
                </label>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)}
                    style={{ background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)', color: '#e74c3c', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.82rem' }}>
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addItem} className="ghost-button" style={{ fontSize: '0.82rem', padding: '6px 16px', marginTop: '4px' }}>
              + Add Item
            </button>
          </div>

          {/* Total */}
          <div style={{ textAlign: 'right', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
            <span style={{ color: '#888', fontSize: '0.85rem', marginRight: '12px' }}>
              Necessary: ₹{items.filter(i => !i.isOptional).reduce((s, i) => s + Number(i.amount || 0), 0).toLocaleString()}
            </span>
            <span style={{ color: '#f39c12', fontSize: '0.85rem', marginRight: '16px' }}>
              Optional: ₹{items.filter(i => i.isOptional).reduce((s, i) => s + Number(i.amount || 0), 0).toLocaleString()}
            </span>
            <span className="oswald" style={{ fontSize: '1.4rem', color: '#fff' }}>
              Total: ₹{items.reduce((s, i) => s + Number(i.amount || 0), 0).toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={submitting} className="angled-button" style={{ minWidth: '200px' }}>
              {submitting ? 'Sending…' : 'SEND INVOICE TO CUSTOMER'}
            </button>
          </div>
        </form>
      )}

      {/* ── Filters ── */}
      {!loading && invoices.length > 0 && (
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search by vehicle…" className="input-field"
            style={{ flex: '1 1 220px' }} value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} />
          <select className="input-field" style={{ flex: '0 0 160px' }} value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            {['Pending', 'Paid'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {/* ── Invoice Cards ── */}
      {loading ? <LoadingSpinner label="Loading invoices…" /> : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#555', border: '1px solid rgba(255,255,255,0.08)' }}>I</div>
          <strong style={{ color: '#888' }}>{invoices.length === 0 ? 'No Invoices Yet' : 'No Results Found'}</strong>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filtered.map((inv, i) => (
            <div key={inv._id} className="hover-card" style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              padding: '24px', borderRadius: '6px', position: 'relative', overflow: 'hidden',
              animation: `fade-in 0.4s ease-out ${i * 60}ms both`,
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
                background: inv.paymentStatus === 'Paid' ? '#2ecc71' : inv.approvalStatus === 'Rejected' ? '#e74c3c' : 'var(--primary)',
              }} />

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 className="oswald" style={{ fontSize: '1.6rem', marginBottom: '4px' }}>
                    ₹{(inv.approvalStatus === 'Pending Approval' ? inv.items.filter(i => i.selected !== false).reduce((s, i) => s + Number(i.amount || 0), 0) : inv.totalAmount)?.toLocaleString()}
                  </h3>
                  <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>
                    {inv.vehicleId?.model} — {inv.vehicleId?.vehicleNumber}
                    {user.role !== 'customer' && inv.vehicleId?.userId?.name && (
                      <span style={{ color: '#666' }}> | Owner: {inv.vehicleId.userId.name}</span>
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <ApprovalBadge status={inv.approvalStatus} />
                  {inv.approvalStatus === 'Approved' && <PayBadge status={inv.paymentStatus} />}
                </div>
              </div>

              {/* Itemized Breakdown */}
              {inv.items && inv.items.length > 0 && (
                <div style={{
                  background: 'rgba(0,0,0,0.2)', borderRadius: '4px',
                  padding: '14px 16px', marginBottom: '14px',
                }}>
                  <div style={{ color: '#666', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                    Cost Breakdown
                  </div>
                  {inv.items.map((item, idx) => (
                    <div key={item._id || idx} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: idx < inv.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      opacity: item.selected === false ? 0.5 : 1,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {user.role === 'customer' && inv.approvalStatus === 'Pending Approval' && item.isOptional && (
                          <input 
                            type="checkbox" 
                            checked={item.selected !== false}
                            onChange={(e) => toggleItem(inv._id, idx, e.target.checked)}
                            style={{ accentColor: '#f39c12', cursor: 'pointer', width: '15px', height: '15px' }}
                          />
                        )}
                        <span style={{
                          padding: '2px 8px', borderRadius: '3px', fontSize: '0.68rem',
                          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                          background: item.isOptional ? 'rgba(243,156,18,0.12)' : 'rgba(46,204,113,0.12)',
                          color: item.isOptional ? '#f39c12' : '#2ecc71',
                        }}>
                          {item.isOptional ? 'Optional' : 'Necessary'}
                        </span>
                        <span style={{ color: '#ccc', textDecoration: item.selected === false ? 'line-through' : 'none' }}>{item.description}</span>
                      </div>
                      <span className="oswald" style={{ color: '#fff', fontWeight: 600, textDecoration: item.selected === false ? 'line-through' : 'none' }}>₹{item.amount?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', marginTop: '10px',
                    paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <span style={{ color: '#888', fontWeight: 500 }}>Total</span>
                    <span className="oswald" style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 700 }}>
                      ₹{(inv.approvalStatus === 'Pending Approval' ? inv.items.filter(i => i.selected !== false).reduce((s, i) => s + Number(i.amount || 0), 0) : inv.totalAmount)?.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: '14px' }}>
                {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>

              {/* ── Customer Actions ── */}
              {user.role === 'customer' && inv.approvalStatus === 'Pending Approval' && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="angled-button"
                    style={{ flex: 1, padding: '10px', fontSize: '0.85rem', background: '#2ecc71', borderColor: '#2ecc71' }}
                    onClick={() => handleApprove(inv._id)}>
                    ✓ APPROVE INVOICE
                  </button>
                  <button className="danger-button"
                    style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                    onClick={() => handleReject(inv._id)}>
                    ✕ REJECT & CANCEL
                  </button>
                </div>
              )}

              {user.role === 'customer' && inv.approvalStatus === 'Approved' && inv.paymentStatus === 'Pending' && (
                <button className="angled-button"
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem', background: '#2ecc71', borderColor: '#2ecc71' }}
                  onClick={() => handlePay(inv._id)}>
                  💳 PAY NOW — ₹{inv.totalAmount?.toLocaleString()}
                </button>
              )}

              {/* ── Admin Actions ── */}
              {user.role === 'admin' && inv.approvalStatus === 'Approved' && inv.paymentStatus !== 'Paid' && (
                <button className="angled-button"
                  style={{ width: '100%', padding: '9px', fontSize: '0.82rem' }}
                  onClick={() => updatePaymentStatus(inv._id, 'Paid')}>
                  Mark as Paid
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
