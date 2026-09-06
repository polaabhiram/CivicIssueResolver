import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

// Leaflet default icon fix
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const Home = () => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [position, setPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([17.3850, 78.4867]); // Hyderabad fallback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(loc);
          setPosition(loc);
        },
        (error) => {
          console.warn("Location access denied or failed. Defaulting to Hyderabad.", error);
        }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text || !image || !position) {
      alert("Please provide text, image, and location.");
      return;
    }

    setErrorMsg('');
    setLoading(true);
    const formData = new FormData();
    formData.append('text', text);
    formData.append('image', image);
    
    // Safely handle both array [lat, lng] and object {lat, lng}
    const lat = position.lat !== undefined ? position.lat : position[0];
    const lng = position.lng !== undefined ? position.lng : position[1];
    formData.append('location', `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`);
    
    formData.append('user_email', localStorage.getItem('email') || 'unknown_citizen');

    try {
      const res = await fetch('http://localhost:8000/api/complaints', {
        method: 'POST',
        body: formData,
      });

      if(res.ok) {
        navigate('/dashboard');
      } else {
        const errorData = await res.json();
        setErrorMsg(errorData.detail || "Failed to submit complaint.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error: Server is unreachable or taking too long. Please restart your Python backend if it crashed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Report an Issue</h1>
        <p className="page-subtitle">Help improve your city by reporting civic infrastructure issues.</p>
      </div>

      <div className="glass-panel" style={{ maxWidth: '800px' }}>
        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger)', padding: '12px', borderRadius: '8px', color: '#fff', marginBottom: '20px', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Describe the problem</label>
            <textarea 
              className="form-control" 
              rows="4" 
              placeholder="e.g. Large pothole on the main street..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Upload Image</label>
            <input 
              type="file" 
              accept="image/*" 
              className="form-control"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pin Location</label>
            <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px'}}>Click on the map to place a pin if the detected location is incorrect.</p>
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater center={mapCenter} />
              <LocationPicker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Analyzing & Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
