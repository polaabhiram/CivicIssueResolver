import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRole }) => {
  const role = localStorage.getItem('role');
  
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  
  if (role === 'user' && allowedRole !== 'user') {
    return <Navigate to="/" replace />;
  }
  
  if ((role === 'superadmin' || role === 'sector_admin') && allowedRole === 'user') {
    return <Navigate to="/admin" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
