"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMemo } from "react";
import { Plant } from "@/lib/types";

const PANIPAT_CENTER = { lat: 29.3909, lng: 76.9635 };
const PANIPAT_BOUNDS = {
    north: 29.6,
    south: 29.2,
    east: 77.2,
    west: 76.7,
};

// Fix default icon issues in Leaflet when using bundlers
const DefaultIcon: L.Icon = L.icon({
    iconUrl: "/marker.png",
    iconRetinaUrl: "/marker.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PlantMapProps {
    plants?: Plant[];
}

const dummyPlants: Plant[] = [
    {
        id: "dummy-1",
        pid: "1",
        name: "Neem Tree",
        user_name: "Admin",
        description: "A healthy neem sapling",
        lat: 29.396,
        lng: 76.97,
        image_url: "",
        created_at: new Date().toISOString(),
        user_id: "admin",
        updated_at: new Date().toISOString(),
    },
    {
        id: "dummy-2",
        pid: "2",
        name: "Peepal Tree",
        user_name: "Admin",
        description: "Sacred fig tree near the park",
        lat: 29.38,
        lng: 76.95,
        image_url: "",
        created_at: new Date().toISOString(),
        user_id: "admin",
        updated_at: new Date().toISOString(),
    },
];

export default function PlantMap({ plants = [] }: PlantMapProps) {
    const items = plants.length ? plants : dummyPlants;

    // Filter to Panipat bounds
    const panipatPlants = useMemo(
        () =>
            items.filter(
                (plant) =>
                    plant.lat >= PANIPAT_BOUNDS.south &&
                    plant.lat <= PANIPAT_BOUNDS.north &&
                    plant.lng >= PANIPAT_BOUNDS.west &&
                    plant.lng <= PANIPAT_BOUNDS.east
            ),
        [items]
    );

    return (
        <div className="relative">
            <MapContainer
                center={[PANIPAT_CENTER.lat, PANIPAT_CENTER.lng]}
                zoom={12}
                style={{
                    height: "500px",
                    width: "100%",
                    borderRadius: "0.5rem",
                }}
                scrollWheelZoom={true}
                minZoom={9}
                maxZoom={18}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {panipatPlants.map((plant) => (
                    <Marker key={plant.id} position={[plant.lat, plant.lng]}>
                        <Popup>
                            <div className="space-y-2">
                                <h3 className="font-bold">{plant.name}</h3>
                                {plant.image_url && (
                                    <img
                                        src={plant.image_url}
                                        alt={plant.name}
                                        className="w-full h-32 object-cover rounded"
                                        onError={(e) => {
                                            e.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                )}
                                {plant.description && (
                                    <p className="text-sm">
                                        {plant.description}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Tracked by {plant.user_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(
                                        plant.created_at
                                    ).toLocaleDateString()} at {new Date(
                                        plant.created_at
                                    ).toLocaleTimeString()}
                                </p>
                                <p className="text-xs text-emerald-600 font-medium">
                                    📍 Panipat, Haryana
                                </p>
                                <p className="text-xs text-blue-600 font-semibold">
                                    PID: {plant.pid}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

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
