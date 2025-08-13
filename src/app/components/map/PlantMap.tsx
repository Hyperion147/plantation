'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plant } from '@/lib/types';

// Fix for default marker icons in Next.js
const defaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface PlantMapProps {
  plants: Plant[];
}

export default function PlantMap({ plants }: PlantMapProps) {
  if (!plants || plants.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted rounded-lg">
        <p className="text-muted-foreground">No plants to display on the map</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {plants.map((plant) => (
        <Marker
          key={plant.id}
          position={[plant.lat, plant.lng]}
          icon={defaultIcon}
        >
          <Popup>
            <div className="space-y-2">
              <h3 className="font-bold">{plant.name}</h3>
              {plant.image_url && (
                <img 
                  src={plant.image_url} 
                  alt={plant.name} 
                  className="w-full h-32 object-cover rounded"
                />
              )}
              <p className="text-sm">{plant.description}</p>
              <p className="text-xs text-muted-foreground">
                Tracked by {plant.user_name}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}