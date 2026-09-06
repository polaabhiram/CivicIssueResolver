import { useState, useEffect } from 'react';
import ImageModal from '../components/ImageModal';

const StatusBadge = ({ status }) => {
  const lc = status.toLowerCase();
  return (
    <span className={`badge badge-${lc}`}>
      {status}
    </span>
  );
};

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('email');
    fetch(`http://localhost:8000/api/complaints/user/${email}`)
      .then(res => res.json())
      .then(data => {
        setComplaints(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Complaints</h1>
        <p className="page-subtitle">Track the real-time status of your submissions.</p>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Description</th>
              <th>Predicted Sector</th>
              <th>Status</th>
              <th>Issue Photo</th>
              <th>Proof of Work</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{textAlign: 'center', padding: '24px'}}>Loading...</td></tr>
            ) : complaints.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign: 'center', padding: '24px'}}>No complaints found.</td></tr>
            ) : (
              complaints.map(c => (
                <tr key={c.id}>
                  <td style={{fontWeight: '500'}}>{c.id}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td style={{maxWidth: '300px'}}>{c.text.substring(0, 50)}...</td>
                  <td style={{textTransform: 'capitalize'}}>{c.assigned_sector}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    <img 
                      src={`http://localhost:8000${c.image_path}`} 
                      alt="issue" 
                      onClick={() => setModalImage(`http://localhost:8000${c.image_path}`)}
                      style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', cursor: 'zoom-in', outline: '2px solid transparent', transition: 'outline 0.2s', ...({':hover': {outline: '2px solid var(--primary-color)'}})}} 
                    />
                  </td>
                  <td>
                    {c.proof_image_path ? (
                      <img 
                        src={`http://localhost:8000${c.proof_image_path}`} 
                        alt="proof" 
                        onClick={() => setModalImage(`http://localhost:8000${c.proof_image_path}`)}
                        style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '2px solid var(--success)', cursor: 'zoom-in'}} 
                      />
                    ) : (
                      <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />
    </div>
  );
};

export default UserDashboard;
