import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

const ChangeView = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], 15);
    }
  }, [location]);

  return null;
};

const LocationPicker = ({ location }) => {
  return (
    <MapContainer
      center={[17.3850, 78.4867]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ChangeView location={location} />

      {location && (
        <Marker position={[location.lat, location.lng]} />
      )}
    </MapContainer>
  );
};

export default LocationPicker;