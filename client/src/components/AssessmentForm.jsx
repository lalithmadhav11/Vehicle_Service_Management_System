import React, { useState } from 'react';

const AssessmentForm = ({ record, onAssessmentSubmit, onCancel }) => {
  const [problems, setProblems] = useState('');
  const [isPossible, setIsPossible] = useState(true);
  const [repairNotPossibleReason, setRepairNotPossibleReason] = useState('');
  
  const [necessaryItems, setNecessaryItems] = useState([]);
  const [optionalItems, setOptionalItems] = useState([]);

  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemType, setNewItemType] = useState('necessary');

  const addItem = () => {
    if (!newItemDesc || !newItemAmount) return;
    const item = { description: newItemDesc, amount: Number(newItemAmount) };
    if (newItemType === 'necessary') setNecessaryItems([...necessaryItems, item]);
    else setOptionalItems([...optionalItems, item]);
    
    setNewItemDesc('');
    setNewItemAmount('');
  };

  const removeItem = (index, type) => {
    if (type === 'necessary') setNecessaryItems(necessaryItems.filter((_, i) => i !== index));
    else setOptionalItems(optionalItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPossible) {
      if (!repairNotPossibleReason.trim()) return alert('Please provide a reason why repair is not possible.');
      onAssessmentSubmit({
        assessmentStatus: 'Not Possible',
        repairNotPossibleReason
      });
    } else {
      if (!problems.trim()) return alert('Please describe the problems.');
      onAssessmentSubmit({
        assessmentStatus: 'Assessed',
        problems,
        necessaryItems,
        optionalItems
      });
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
    color: '#fff', padding: '10px', borderRadius: '4px', width: '100%', fontSize: '0.9rem'
  };

  return (
    <div style={{
      marginTop: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', 
      borderRadius: '6px', borderLeft: '4px solid var(--primary)'
    }}>
      <h4 style={{ color: 'var(--primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Vehicle Assessment
      </h4>
      
      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
        <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="radio" checked={isPossible} onChange={() => setIsPossible(true)} />
          Repair Possible
        </label>
        <label style={{ color: '#ff4444', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="radio" checked={!isPossible} onChange={() => setIsPossible(false)} />
          Repair NOT Possible
        </label>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {!isPossible ? (
          <div>
            <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Reason</label>
            <textarea 
              value={repairNotPossibleReason} onChange={e => setRepairNotPossibleReason(e.target.value)}
              style={{ ...inputStyle, minHeight: '80px' }} placeholder="Explain why it cannot be repaired..." required
            />
          </div>
        ) : (
          <>
            <div>
              <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Problems Found</label>
              <textarea 
                value={problems} onChange={e => setProblems(e.target.value)}
                style={{ ...inputStyle, minHeight: '80px' }} placeholder="Describe the vehicle's issues..." required
              />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '12px', fontWeight: 600 }}>Add Required/Optional Parts & Labor</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <input type="text" placeholder="Description" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} style={{ ...inputStyle, flex: '2 1 150px' }} />
                <input type="number" placeholder="Cost (₹)" value={newItemAmount} onChange={e => setNewItemAmount(e.target.value)} style={{ ...inputStyle, flex: '1 1 80px' }} />
                <select value={newItemType} onChange={e => setNewItemType(e.target.value)} style={{ ...inputStyle, flex: '1 1 120px' }}>
                  <option value="necessary">Necessary</option>
                  <option value="optional">Optional</option>
                </select>
                <button type="button" onClick={addItem} style={{ padding: '0 16px', background: 'var(--primary)', color: '#111', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>ADD</button>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {necessaryItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(46, 204, 113, 0.1)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
                    <span style={{ color: '#ccc' }}>[Necessary] {item.description}</span>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>₹{item.amount}</span>
                      <button type="button" onClick={() => removeItem(idx, 'necessary')} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                ))}
                {optionalItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(243, 156, 18, 0.1)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(243, 156, 18, 0.2)' }}>
                    <span style={{ color: '#ccc' }}>[Optional] {item.description}</span>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span style={{ color: '#f39c12', fontWeight: 'bold' }}>₹{item.amount}</span>
                      <button type="button" onClick={() => removeItem(idx, 'optional')} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="button" onClick={onCancel} style={{ padding: '10px 20px', background: 'transparent', color: '#888', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>
          <button type="submit" style={{ padding: '10px 20px', background: 'var(--primary)', color: '#111', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            SUBMIT ASSESSMENT
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;
