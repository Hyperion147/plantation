'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plant } from '@/lib/types';

// Fix for default marker icons in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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

  // Calculate center based on plants or use default
  const center = plants.length > 0 
    ? [plants[0].lat, plants[0].lng] 
    : [20, 0];

  return (
    <MapContainer
      center={center as [number, number]}
      zoom={plants.length === 1 ? 10 : 2}
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
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              {plant.description && (
                <p className="text-sm">{plant.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Tracked by {plant.user_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(plant.created_at).toLocaleDateString()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}