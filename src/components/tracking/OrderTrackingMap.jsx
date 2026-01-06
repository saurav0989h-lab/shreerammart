import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Truck, MapPin, Phone, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const deliveryIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background: #06b6d4; padding: 8px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
      <path d="M15 18H9"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
      <circle cx="17" cy="18" r="2"/>
      <circle cx="7" cy="18" r="2"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const destinationIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background: #10b981; padding: 8px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Simulated delivery tracking - in production this would come from driver app
function useSimulatedTracking(order) {
  // Dang, Nepal coordinates (Ghorahi area)
  const destination = [28.0333, 82.4833];
  const shopLocation = [28.0380, 82.4900]; // Starting point
  
  const [driverLocation, setDriverLocation] = useState(shopLocation);
  const [eta, setEta] = useState(15);

  useEffect(() => {
    // Simulate driver movement
    const interval = setInterval(() => {
      setDriverLocation(prev => {
        const latDiff = (destination[0] - prev[0]) * 0.1;
        const lngDiff = (destination[1] - prev[1]) * 0.1;
        return [prev[0] + latDiff, prev[1] + lngDiff];
      });
      setEta(prev => Math.max(1, prev - 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [destination]);

  return { driverLocation, destination, eta, driverName: 'Ram Bahadur', driverPhone: '+977-9812345678' };
}

export default function OrderTrackingMap({ order }) {
  const { driverLocation, destination, eta, driverName, driverPhone } = useSimulatedTracking(order);
  const center = [28.0356, 82.4866]; // Center of Dang

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Truck className="w-5 h-5 text-cyan-600" />
          Live Tracking
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-cyan-600" />
          <span className="font-medium text-cyan-700">ETA: ~{eta} mins</span>
        </div>
      </div>

      {/* Driver Info */}
      <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
            {driverName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{driverName}</p>
            <p className="text-sm text-gray-500">Delivery Partner</p>
          </div>
        </div>
        <a 
          href={`tel:${driverPhone}`}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">Call</span>
        </a>
      </div>

      {/* Map */}
      <div className="h-64 rounded-xl overflow-hidden border">
        <MapContainer 
          center={center} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          
          {/* Driver Marker */}
          <Marker position={driverLocation} icon={deliveryIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-medium">{driverName}</p>
                <p className="text-sm text-gray-500">Your delivery partner</p>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          <Marker position={destination} icon={destinationIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-medium">Delivery Location</p>
                <p className="text-sm text-gray-500">{order.address_area}</p>
              </div>
            </Popup>
          </Marker>

          {/* Route Line */}
          <Polyline 
            positions={[driverLocation, destination]} 
            color="#06b6d4" 
            weight={4}
            dashArray="10, 10"
          />
        </MapContainer>
      </div>

      <p className="text-xs text-gray-500 text-center">
        📍 Location updates automatically. Driver location is approximate.
      </p>
    </div>
  );
}