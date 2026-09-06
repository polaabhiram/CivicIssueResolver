import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ImageModal from '../components/ImageModal';

const SectorDashboard = () => {
  const { name } = useParams();
  const [complaints, setComplaints] = useState([]);
  const fileInputRef = useRef(null);
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  const fetchSectorComplaints = () => {
    fetch(`http://localhost:8000/api/complaints/sector/${name}`)
      .then(res => res.json())
      .then(data => setComplaints(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSectorComplaints();
  }, [name]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:8000/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if(res.ok) {
        fetchSectorComplaints();
      }
    } catch(err) {
      console.error(err);
    }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this complaint?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/complaints/${id}`, {
        method: 'DELETE'
      });
      if(res.ok) {
        fetchSectorComplaints();
      }
    } catch(err) {
      console.error("Deletion failed", err);
    }
  };

  const handleResolveImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeComplaint) return;

    const formData = new FormData();
    formData.append('proof_image', file);

    try {
      const res = await fetch(`http://localhost:8000/api/complaints/${activeComplaint}/resolve`, {
        method: 'POST',
        body: formData
      });
      if(res.ok) {
        fetchSectorComplaints();
      }
    } catch(err) {
      console.error(err);
    } finally {
      setActiveComplaint(null);
      e.target.value = null; // reset
    }
  };

  const triggerUpload = (id) => {
    setActiveComplaint(id);
    fileInputRef.current.click();
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title" style={{textTransform: 'capitalize'}}>{name} Department</h1>
        <p className="page-subtitle">Manage and resolve reported issues in your domain.</p>
      </div>

      <div className="grid grid-cols-2">
        {complaints.length === 0 ? (
          <p>No complaints routed to {name}.</p>
        ) : (
          complaints.map(c => (
            <div key={c.id} className="glass-panel" style={{display: 'flex', gap: '20px', flexDirection: 'column'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontWeight: '700', color: 'var(--primary-color)'}}>{c.id}</span>
                <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
              </div>
              
              <div style={{display: 'flex', gap: '16px'}}>
                <img 
                  src={`http://localhost:8000${c.image_path}`} 
                  alt="Issue evidence" 
                  onClick={() => setModalImage(`http://localhost:8000${c.image_path}`)}
                  style={{width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', cursor: 'zoom-in', outline: '2px solid transparent', transition: 'outline 0.2s', ...({':hover': {outline: '2px solid var(--primary-color)'}})}}
                />
                <div>
                  <p style={{marginBottom: '8px', fontSize: '0.9rem'}}>{c.text}</p>
                  <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Loc: {c.location}</p>
                  <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Reported: {new Date(c.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {c.status === 'Pending' ? (
                <div style={{display: 'flex', gap: '12px', marginTop: '10px'}}>
                  <button 
                    className="btn" 
                    style={{backgroundColor: 'var(--success)'}}
                    onClick={() => triggerUpload(c.id)}
                  >
                    Mark Resolved (Upload Proof)
                  </button>
                  <button 
                    className="btn" 
                    style={{backgroundColor: 'var(--danger)'}}
                    onClick={() => updateStatus(c.id, 'Fake')}
                  >
                    Mark Fake
                  </button>
                </div>
              ) : (
                <div style={{display: 'flex', gap: '12px', marginTop: '10px'}}>
                  <button 
                    className="btn" 
                    style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)'}}
                    onClick={() => deleteComplaint(c.id)}
                  >
                    🗑 Permanently Delete Ticket
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />
      
      {/* Hidden file input for resolution proof */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleResolveImageUpload}
      />
    </div>
  );
};

export default SectorDashboard;