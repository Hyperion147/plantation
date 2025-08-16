"use client";


import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { useState } from 'react';

const PANIPAT_CENTER = { lat: 29.3909, lng: 76.9635 };
const PANIPAT_BOUNDS = {
    north: 29.6,
    south: 29.2,
    east: 77.2,
    west: 76.7,
};

// Plant type definition (adjust if needed)
interface Plant {
    id: string | number;
    lat: number;
    lng: number;
    name: string;
    user_name: string;
    description?: string;
    image_url?: string;
    created_at: string;
}

interface PlantMapProps {
    plants?: Plant[];
}

export default function PlantMap({ plants = [] }: PlantMapProps) {
    // Filter plants within bounds
    const panipatPlants = plants.filter((plant) =>
        plant.lat >= PANIPAT_BOUNDS.south && plant.lat <= PANIPAT_BOUNDS.north &&
        plant.lng >= PANIPAT_BOUNDS.west && plant.lng <= PANIPAT_BOUNDS.east
    );

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    });
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

    return (
        <div className="relative">
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={{ height: '500px', width: '100%', borderRadius: '0.5rem' }}
                    center={PANIPAT_CENTER}
                    zoom={11}
                    options={{
                        restriction: {
                            latLngBounds: {
                                north: PANIPAT_BOUNDS.north,
                                south: PANIPAT_BOUNDS.south,
                                east: PANIPAT_BOUNDS.east,
                                west: PANIPAT_BOUNDS.west,
                            },
                            strictBounds: true,
                        },
                        minZoom: 9,
                        maxZoom: 18,
                        mapTypeId: 'roadmap',
                    }}
                >
                    {panipatPlants.length > 0 ? (
                        panipatPlants.map((plant) => (
                            <Marker
                                key={plant.id}
                                position={{ lat: plant.lat, lng: plant.lng }}
                                onClick={() => setSelectedPlant(plant)}
                            />
                        ))
                    ) : (
                        <Marker position={PANIPAT_CENTER} />
                    )}
                    {selectedPlant && (
                        <InfoWindow
                            position={{ lat: selectedPlant.lat, lng: selectedPlant.lng }}
                            onCloseClick={() => setSelectedPlant(null)}
                        >
                            <div className="space-y-2">
                                <h3 className="font-bold">{selectedPlant.name}</h3>
                                {selectedPlant.image_url && (
                                    <img
                                        src={selectedPlant.image_url}
                                        alt={selectedPlant.name}
                                        className="w-full h-32 object-cover rounded"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                )}
                                {selectedPlant.description && (
                                    <p className="text-sm">{selectedPlant.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Tracked by {selectedPlant.user_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(selectedPlant.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-emerald-600 font-medium">
                                    📍 Panipat, Haryana
                                </p>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            ) : (
                <div>Loading Map...</div>
            )}
            {/* Map Info Overlay */}
            <div className="absolute top-4 left-4 z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="text-xs text-muted-foreground">
                        <p className="font-medium text-emerald-600">
                            🌱 Panipat Plant Tracker
                        </p>
                        <p>{panipatPlants.length} plants in area</p>
                        <p className="text-xs">
                            Map restricted to Panipat, Haryana
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
