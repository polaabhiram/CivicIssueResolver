import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);

  const role = localStorage.getItem('role');
  const sector = localStorage.getItem('sector');

  const fetchComplaints = () => {
    fetch('http://localhost:8000/api/complaints')
      .then(res => res.json())
      .then(data => setComplaints(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (role === 'superadmin') {
      fetchComplaints();
    }
  }, [role]);

  if (role === 'sector_admin') {
    return <Navigate to={`/admin/sector/${sector}`} replace />;
  }

  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const completedCount = complaints.filter(c => c.status === 'Completed').length;
  const fakeCount = complaints.filter(c => c.status === 'Fake').length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Global Administrative Overview</h1>
        <p className="page-subtitle">Monitor and oversee all civic issues securely.</p>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: '40px' }}>
        <div className="stat-card">
          <span className="stat-title">Total Issues</span>
          <span className="stat-value">{complaints.length}</span>
        </div>
        <div className="stat-card" style={{borderLeft: '4px solid var(--warning)'}}>
          <span className="stat-title">Pending</span>
          <span className="stat-value">{pendingCount}</span>
        </div>
        <div className="stat-card" style={{borderLeft: '4px solid var(--success)'}}>
          <span className="stat-title">Completed</span>
          <span className="stat-value">{completedCount}</span>
        </div>
        <div className="stat-card" style={{borderLeft: '4px solid var(--danger)'}}>
          <span className="stat-title">Fake / Invalid</span>
          <span className="stat-value">{fakeCount}</span>
        </div>
      </div>

      <h3 style={{marginBottom: '20px'}}>All Complaints Activity</h3>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sector</th>
              <th>Text Engine</th>
              <th>Vision Engine</th>
              <th>Status</th>
              <th>Action / Details</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td style={{textTransform: 'capitalize'}}>{c.assigned_sector}</td>
                <td>{c.text_prediction}</td>
                <td>{c.image_prediction}</td>
                <td>
                  <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                </td>
                <td>View</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
