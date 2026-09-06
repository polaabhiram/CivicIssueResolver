import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        CivicResolver
      </div>
      <nav className="sidebar-nav">
        <div style={{ marginTop: '10px', marginBottom: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Admin Panel
        </div>
        <Link to="/admin" className={`nav-item ${isActive('/admin')}`}>
          <span>Overview</span>
        </Link>
        <div style={{ marginTop: '20px', marginBottom: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          SECTORS
        </div>

        {(localStorage.getItem('sector') === 'all' || localStorage.getItem('sector') === 'roads') && (
          <Link to="/admin/sector/roads" className={`nav-item ${isActive('/admin/sector/roads')}`}>
            <span>Roads Dept</span>
          </Link>
        )}

        {(localStorage.getItem('sector') === 'all' || localStorage.getItem('sector') === 'water') && (
          <Link to="/admin/sector/water" className={`nav-item ${isActive('/admin/sector/water')}`}>
            <span>Water Dept</span>
          </Link>
        )}

        {(localStorage.getItem('sector') === 'all' || localStorage.getItem('sector') === 'sanitation') && (
          <Link to="/admin/sector/sanitation" className={`nav-item ${isActive('/admin/sector/sanitation')}`}>
            <span>Sanitation Dept</span>
          </Link>
        )}

        {(localStorage.getItem('sector') === 'all' || localStorage.getItem('sector') === 'electricity') && (
          <Link to="/admin/sector/electricity" className={`nav-item ${isActive('/admin/sector/electricity')}`}>
            <span>Electricity Dept</span>
          </Link>
        )}

        {(localStorage.getItem('sector') === 'all' || localStorage.getItem('sector') === 'drainage') && (
          <Link to="/admin/sector/drainage" className={`nav-item ${isActive('/admin/sector/drainage')}`}>
            <span>Drainage Dept</span>
          </Link>
        )}

        {(localStorage.getItem('sector') === 'all' || localStorage.getItem('sector') === 'infrastructure') && (
          <Link to="/admin/sector/infrastructure" className={`nav-item ${isActive('/admin/sector/infrastructure')}`}>
            <span>Infrastructure Dept</span>
          </Link>
        )}

        <button onClick={handleLogout} className="nav-item" style={{ marginTop: 'auto', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', cursor: 'pointer', justifyContent: 'center' }}>
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
