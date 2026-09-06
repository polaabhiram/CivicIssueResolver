import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="layout" style={{ flexDirection: 'column' }}>
      <header className="glass-panel" style={{ borderRadius: 0, borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', background: '-webkit-linear-gradient(45deg, var(--primary-color), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CivicResolver
        </div>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: '500', color: isActive('/') ? 'var(--text-main)' : 'var(--text-muted)' }}>Report Issue</Link>
          <Link to="/dashboard" style={{ fontWeight: '500', color: isActive('/dashboard') ? 'var(--text-main)' : 'var(--text-muted)' }}>My Complaints</Link>
          <button onClick={handleLogout} className="btn" style={{ marginLeft: '10px', padding: '6px 12px', fontSize: '0.85rem', border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent' }}>Logout</button>
        </nav>
      </header>
      <main className="main-content" style={{ marginLeft: 0, flexGrow: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
