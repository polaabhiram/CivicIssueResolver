import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="layout">
      <Sidebar />
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', marginLeft: '260px' }}>
        <header style={{ 
          height: '60px', 
          borderBottom: '1px solid var(--glass-border)', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          padding: '0 40px', 
          backgroundColor: 'rgba(5, 5, 5, 0.4)' 
        }}>
          <button 
            onClick={handleLogout} 
            className="btn" 
            style={{ padding: '6px 12px', fontSize: '0.85rem', border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent' }}
          >
            Logout ({localStorage.getItem('email')})
          </button>
        </header>
        <main className="main-content" style={{ marginLeft: 0, padding: '40px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
