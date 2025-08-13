'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { query } from '@/app/config/db';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Dynamically import the map component to avoid SSR issues
const PlantMap = dynamic(() => import('@/app/components/map/PlantMap'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[500px]" />,
});

export default function MapPage() {
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await query(`
          SELECT id, name, description, image_url, 
                 ST_X(location) as lng, ST_Y(location) as lat,
                 user_name, created_at
          FROM plants
        `);
        setPlants(res.rows);
      } catch (error) {
        console.error('Error fetching plants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlants();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plant Map</h1>
        <p className="text-muted-foreground">
          Explore all the plants tracked by our community
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Interactive Map</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="w-full h-[500px]" />
          ) : (
            <PlantMap plants={plants} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}