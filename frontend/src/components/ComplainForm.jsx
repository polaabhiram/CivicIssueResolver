import React, { useState, useEffect, useRef } from "react";
import LocationPicker from "./LocationPicker";

const ComplaintForm = ({ onSubmit }) => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [location, setLocation] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  // 🔥 ESC key close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowPreview(false);
      }
    };

    if (showPreview) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showPreview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const newPreview = URL.createObjectURL(file);

    setImage(file);
    setPreview(newPreview);
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => {
        alert("Location access denied");
      }
    );
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const response = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      location
    })
  });

  const result = await response.json();

  const complaint = {
    id: Date.now(),
    image,
    text,
    location,
    ...result
  };

  onSubmit(complaint);

  // reset logic (same as before)
};

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>Report Issue</h3>


      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        <button
          type="button"
          onClick={() => setShowPreview(true)}
        >
          Preview Image
        </button>
      </div>


      {showPreview && preview && (
        <div
          style={styles.overlay}
          onClick={() => setShowPreview(false)}
        >
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={preview} alt="preview" style={styles.image} />
          </div>
        </div>
      )}

      <textarea
        placeholder="Describe the issue..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {location && (
        <p>
          📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      )}


      
      
        <button type="button" onClick={getLocation} style={{width:"30%"}}>
        Get Location
      </button>

      <button type="submit" style={{width:"100%"}}>Submit</button>
      
      


      <div style={styles.mapContainer}>
        <LocationPicker location={location} />
      </div>
    </form>
  );
};

const styles = {
  form: {
    display: "flex",
    justifyContent:"center",
    flexDirection: "column",
    gap: "12px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px"
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(30, 41, 59, 0.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },

  modal: {
    maxWidth: "90%",
    maxHeight: "90%"
  },

  image: {
    width: "100%",
    borderRadius: "10px"
  },

  mapContainer: {
    width: "100%",
    height: "300px",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #ccc"
  }
};

export default ComplaintForm;