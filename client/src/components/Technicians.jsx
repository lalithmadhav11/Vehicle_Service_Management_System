import React, { useState, useEffect } from 'react';

const Technicians = ({ user }) => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    experience: ''
  });

  const fetchTechnicians = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/technicians', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch technicians');
      setTechnicians(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, [user.token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/technicians', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add technician');
      }
      setShowAddForm(false);
      setFormData({ name: '', specialization: '', experience: '' });
      fetchTechnicians();
    } catch (err) {
      alert(err.message);
    }
  };

  if (user.role === 'customer') {
    return <div style={{ color: '#ff4d4d' }}>Access Denied</div>;
  }

  return (
    <div style={{ animation: 'fade-in 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="oswald" style={{ fontSize: '2.5rem', color: '#fff' }}>TECHNICIAN DIRECTORY</h2>
        {user.role === 'admin' && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="ghost-button">
            {showAddForm ? 'CANCEL' : '+ ADD TECHNICIAN'}
          </button>
        )}
      </div>

      {error && <div style={{ color: '#ff4d4d', marginBottom: '15px' }}>{error}</div>}

      {showAddForm && user.role === 'admin' && (
        <form onSubmit={handleAddSubmit} style={{ background: 'var(--surface)', padding: '30px', borderRadius: '4px', marginBottom: '30px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="John Doe" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Specialization</label>
            <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="input-field" placeholder="Engine Diagnostics" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Experience (Years)</label>
            <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="input-field" placeholder="5" required />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="angled-button" style={{ width: '100%' }}>SAVE TECHNICIAN</button>
          </div>
        </form>
      )}

      {!loading && technicians.length > 0 && (
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
          <input 
            type="text" 
            placeholder="Search technicians by name or specialization..." 
            className="input-field" 
            style={{ flex: 1 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {(() => {
        const filteredTechnicians = technicians.filter(t => {
          const search = searchTerm.toLowerCase();
          return t.name.toLowerCase().includes(search) || t.specialization.toLowerCase().includes(search);
        });

        if (loading) return <p>Loading technicians...</p>;
        
        if (filteredTechnicians.length === 0) {
          return (
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: '4px' }}>
              <p style={{ color: '#888' }}>No technicians found matching criteria.</p>
            </div>
          );
        }

        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredTechnicians.map((tech) => (
              <div 
                key={tech._id} 
                style={{ 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)', 
                  padding: '25px', 
                  borderRadius: '4px', 
                  textAlign: 'center',
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
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', 
                margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary)', fontSize: '2rem', fontWeight: 'bold' 
              }}>
                {tech.name.charAt(0)}
              </div>
              <h3 className="oswald" style={{ fontSize: '1.4rem', marginBottom: '5px' }}>{tech.name}</h3>
              <p style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '10px' }}>{tech.specialization}</p>
              <div style={{ color: '#888', fontSize: '0.85rem' }}>Experience: {tech.experience} Years</div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
};

export default Technicians;
