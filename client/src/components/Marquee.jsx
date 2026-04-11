import React from 'react';
import '../App.css';

const Marquee = () => {
  const marqueeFeatures = [
    "Book Appointment", "Track Repairs", "Service History", 
    "Invoice Generation", "Technician Dashboard", "Reminder Alerts", 
    "Role-Based Access", "Admin Control"
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100vw',
      height: '120px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20
    }}>
      <div style={{
        position: 'absolute',
        top: '50%', left: '-5%', right: '-5%',
        transform: 'translateY(-50%) rotate(-3deg)',
        background: '#111',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '8px 0',
        display: 'flex', 
        width: '110vw',
        fontFamily: "'Inter', sans-serif",
        fontSize: '1.0rem',
        letterSpacing: '3px',
        zIndex: 1,
        boxShadow: '0 5px 15px rgba(0,0,0,0.8)'
      }}>
        <div style={{ display: 'inline-flex', animation: 'marquee-reverse 40s linear infinite' }}>
          {[...marqueeFeatures, ...marqueeFeatures, ...marqueeFeatures].map((item, idx) => (
            <React.Fragment key={`tilt-${idx}`}>
              <div style={{ margin: '0 30px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>
                {item.toUpperCase()}
              </div>
              <span style={{ fontSize: '1.0rem', margin: '0 30px', color: 'rgba(255,255,255,0.1)' }}>✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div style={{
        position: 'absolute',
        top: '50%', left: 0, right: 0,
        transform: 'translateY(-50%) rotate(0deg)',
        background: 'var(--primary)',
        padding: '12px 0',
        display: 'flex', 
        width: '100vw',
        fontFamily: "'Inter', sans-serif",
        fontSize: '1.3rem',
        fontWeight: 700,
        letterSpacing: '2px',
        boxShadow: '0 0 40px rgba(204,0,0,0.5)',
        zIndex: 2
      }}>
        <div style={{ display: 'inline-flex', animation: 'marquee 30s linear infinite' }}>
          {[...marqueeFeatures, ...marqueeFeatures, ...marqueeFeatures].map((item, idx) => (
            <React.Fragment key={`str-${idx}`}>
              <div style={{ margin: '0 30px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', color: '#fff' }}>
                {item.toUpperCase()}
              </div>
              <span style={{ fontSize: '1.1rem', margin: '0 30px', color: '#7a0505' }}>✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
