'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngBounds, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plant } from '@/lib/types';
import { useEffect } from 'react';

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

// Panipat, Haryana coordinates and bounds
const PANIPAT_CENTER: LatLngTuple = [29.3909, 76.9635]; // Panipat city center
const PANIPAT_BOUNDS: LatLngTuple[] = [
  [29.2, 76.7], // Southwest bounds (southwest of Panipat)
  [29.6, 77.2], // Northeast bounds (northeast of Panipat)
];

// Component to set map bounds and restrictions
function MapBoundsController() {
  const map = useMap();

  useEffect(() => {
    // Set the maximum bounds to Panipat area
    map.setMaxBounds(PANIPAT_BOUNDS as L.LatLngBoundsExpression);
    
    // Set the view to Panipat center with appropriate zoom
    map.setView(PANIPAT_CENTER, 11);
    
    // Prevent zooming out too far
    map.setMinZoom(9);
    map.setMaxZoom(18);
    
    // Add event listener to prevent dragging outside bounds
    const handleDrag = () => {
      const bounds = map.getBounds();
      const panipatBounds = L.latLngBounds(PANIPAT_BOUNDS);
      if (!bounds.intersects(panipatBounds)) {
        map.setView(PANIPAT_CENTER, map.getZoom());
      }
    };
    
    map.on('drag', handleDrag);
    
    return () => {
      map.off('drag', handleDrag);
    };
  }, [map]);

  return null;
}

interface PlantMapProps {
  plants: Plant[];
}

export default function PlantMap({ plants }: PlantMapProps) {
  // Filter plants to only show those within Panipat bounds
  const panipatPlants = plants.filter(plant => {
    const lat = plant.lat;
    const lng = plant.lng;
    return (
      lat >= PANIPAT_BOUNDS[0][0] && 
      lat <= PANIPAT_BOUNDS[1][0] && 
      lng >= PANIPAT_BOUNDS[0][1] && 
      lng <= PANIPAT_BOUNDS[1][1]
    );
  });

  if (!panipatPlants || panipatPlants.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted rounded-lg">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No plants in Panipat area</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapContainer
        center={PANIPAT_CENTER}
        zoom={11}
        style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }}
        className="z-0"
        maxBounds={PANIPAT_BOUNDS as L.LatLngBoundsExpression}
        maxBoundsViscosity={1.0}
        minZoom={9}
        maxZoom={18}
      >
        <MapBoundsController />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          bounds={PANIPAT_BOUNDS as L.LatLngBoundsExpression}
        />
        
        {panipatPlants.map((plant) => (
          <Marker
            key={plant.id}
            position={[plant.lat, plant.lng] as LatLngTuple}
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
                <p className="text-xs text-emerald-600 font-medium">
                  📍 Panipat, Haryana
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Info Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-emerald-600">🌱 Panipat Plant Tracker</p>
            <p>{panipatPlants.length} plants in area</p>
            <p className="text-xs">Map restricted to Panipat, Haryana</p>
          </div>
        </div>
      </div>
    </div>
  );
}