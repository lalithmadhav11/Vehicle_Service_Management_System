import React, { useState, useEffect } from 'react';
import Vehicles from './Vehicles';
import Appointments from './Appointments';
import AdminPanel from './AdminPanel';
import Invoices from './Invoices';
import ServiceRecords from './ServiceRecords';
import Technicians from './Technicians';
import Notifications from './Notifications';

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState({
    vehiclesCount: 0,
    appointmentsCount: 0,
    pendingInvoices: 0,
    unreadNotifications: 0
  });

  // Fetch quick overview stats for the user (customer/tech perspective)
  useEffect(() => {
    if (user.role === 'admin') return; 
    
    const fetchOverview = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        
        // Parallel fetch for basic stats
        const [vehRes, appRes, invRes, notifRes] = await Promise.all([
          fetch('http://localhost:5000/api/vehicles', { headers }),
          fetch('http://localhost:5000/api/appointments', { headers }),
          fetch('http://localhost:5000/api/invoices', { headers }),
          fetch('http://localhost:5000/api/notifications', { headers })
        ]);
        
        const vehData = vehRes.ok ? await vehRes.json() : { total: 0 };
        const appData = appRes.ok ? await appRes.json() : [];
        const invData = invRes.ok ? await invRes.json() : [];
        const notifData = notifRes.ok ? await notifRes.json() : [];
        
        setOverviewData({
          vehiclesCount: vehData.vehicles ? vehData.vehicles.length : 0,
          appointmentsCount: appData.length || 0,
          pendingInvoices: invData.filter(i => i.paymentStatus === 'Pending').length || 0,
          unreadNotifications: notifData.filter(n => !n.isRead).length || 0
        });
      } catch(err) {
        console.error(err);
      }
    };
    fetchOverview();
  }, [user]);

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'services', label: 'Service Records' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'notifications', label: 'Notifications' }
  ];

  if (user.role !== 'customer') {
    navItems.push({ id: 'technicians', label: 'Technicians' });
  }

  if (user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Panel' });
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'vehicles':
        return <Vehicles user={user} />;
      case 'appointments':
        return <Appointments user={user} />;
      case 'services':
        return <ServiceRecords user={user} />;
      case 'invoices':
        return <Invoices user={user} />;
      case 'technicians':
        return <Technicians user={user} />;
      case 'notifications':
        return <Notifications user={user} />;
      case 'admin':
        return <AdminPanel user={user} />;
      case 'overview':
      default:
        if (user.role === 'admin') {
          return (
             <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <h3 className="oswald" style={{fontSize: '2rem'}}>Welcome to Admin Control</h3>
                <p style={{color: '#888'}}>Please switch to the Admin Panel tab to view system metrics.</p>
                <button onClick={() => setActiveTab('admin')} className="angled-button" style={{marginTop: '20px'}}>GO TO ADMIN PANEL</button>
             </div>
          );
        }
        
        return (
          <div style={{ animation: 'fade-in 0.5s ease-out' }}>
            <h2 className="oswald" style={{ fontSize: '2.5rem', marginBottom: '30px', color: '#fff' }}>AT A GLANCE</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px'
            }}>
              {/* Card 1 */}
              <div onClick={() => setActiveTab('vehicles')} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '40px 30px',
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                transition: 'transform 0.3s',
                cursor: 'pointer'
              }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                <h3 className="oswald" style={{fontSize: '1.8rem', marginBottom: '15px'}}>MY VEHICLES</h3>
                <div style={{fontSize: '3.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '25px'}}>{overviewData.vehiclesCount}</div>
                <button className="ghost-button" style={{width: '100%'}}>Manage Vehicles</button>
                <div style={{position: 'absolute', top: '-40px', right: '-40px', background: 'var(--primary-glow)', width: '150px', height: '150px', borderRadius: '50%', filter: 'blur(50px)'}}></div>
              </div>
              
              {/* Card 2 */}
              <div onClick={() => setActiveTab('appointments')} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '40px 30px',
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                transition: 'transform 0.3s',
                cursor: 'pointer'
              }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                <h3 className="oswald" style={{fontSize: '1.8rem', marginBottom: '15px'}}>APPOINTMENTS</h3>
                <div style={{fontSize: '3.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '25px'}}>{overviewData.appointmentsCount}</div>
                <button className="ghost-button" style={{width: '100%'}}>View Schedule</button>
                <div style={{position: 'absolute', top: '-40px', right: '-40px', background: 'var(--primary-glow)', width: '150px', height: '150px', borderRadius: '50%', filter: 'blur(50px)'}}></div>
              </div>

              {/* Card 3 */}
              <div onClick={() => setActiveTab('invoices')} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '40px 30px',
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                transition: 'transform 0.3s',
                cursor: 'pointer'
              }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                <h3 className="oswald" style={{fontSize: '1.8rem', marginBottom: '15px'}}>PENDING INVOICES</h3>
                <div style={{fontSize: '3.5rem', fontWeight: 700, color: overviewData.pendingInvoices > 0 ? '#e74c3c' : 'var(--primary)', marginBottom: '25px'}}>{overviewData.pendingInvoices}</div>
                <button className="ghost-button" style={{width: '100%'}}>View Invoices</button>
                <div style={{position: 'absolute', top: '-40px', right: '-40px', background: overviewData.pendingInvoices > 0 ? 'rgba(231, 76, 60, 0.4)' : 'var(--primary-glow)', width: '150px', height: '150px', borderRadius: '50%', filter: 'blur(50px)'}}></div>
              </div>

              {/* Card 4 */}
              <div onClick={() => setActiveTab('notifications')} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '40px 30px',
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                transition: 'transform 0.3s',
                cursor: 'pointer'
              }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                <h3 className="oswald" style={{fontSize: '1.8rem', marginBottom: '15px'}}>NEW NOTICES</h3>
                <div style={{fontSize: '3.5rem', fontWeight: 700, color: overviewData.unreadNotifications > 0 ? '#f39c12' : 'var(--primary)', marginBottom: '25px'}}>{overviewData.unreadNotifications}</div>
                <button className="ghost-button" style={{width: '100%'}}>Check Alerts</button>
                <div style={{position: 'absolute', top: '-40px', right: '-40px', background: overviewData.unreadNotifications > 0 ? 'rgba(243, 156, 18, 0.4)' : 'var(--primary-glow)', width: '150px', height: '150px', borderRadius: '50%', filter: 'blur(50px)'}}></div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      minHeight: '100vh',
      paddingTop: '80px', // accounting for fixed header
      position: 'relative',
      background: 'var(--background)'
    }}>
      {/* Grid Background Effect */}
      <div className="grid-overlay" style={{position: 'fixed', zIndex: 0}}></div>

      {/* Side Navigation */}
      <div style={{
        flex: '0 0 280px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        minHeight: 'calc(100vh - 80px)',
        zIndex: 10,
        padding: '30px 0',
        position: 'relative'
      }}>
        <div style={{ padding: '0 30px', marginBottom: '30px' }}>
          <div style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>LOGGED IN AS</div>
          <div className="oswald" style={{ fontSize: '1.5rem', color: 'var(--primary)', lineHeight: 1.2 }}>{user.name}</div>
          <div style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '5px' }}>Role: <span style={{color: '#fff', textTransform: 'capitalize'}}>{user.role}</span></div>
        </div>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {navItems.map(item => (
            <li key={item.id} onClick={() => setActiveTab(item.id)} style={{
              padding: '15px 30px',
              cursor: 'pointer',
              borderLeft: activeTab === item.id ? '4px solid var(--primary)' : '4px solid transparent',
              background: activeTab === item.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              color: activeTab === item.id ? '#fff' : '#888',
              transition: '0.3s',
              display: 'flex',
              alignItems: 'center',
              fontWeight: activeTab === item.id ? '600' : '400',
              fontFamily: '"Oswald", sans-serif',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }} onMouseOver={e=>{if(activeTab!==item.id) {e.target.style.background='rgba(255,255,255,0.02)'; e.target.style.color='#fff';}}} onMouseOut={e=>{if(activeTab!==item.id) {e.target.style.background='transparent'; e.target.style.color='#888';}}}>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        minWidth: '300px',
        padding: '40px 40px',
        position: 'relative',
        zIndex: 2,
        boxSizing: 'border-box'
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
