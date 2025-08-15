// app/components/PlantSearch.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Search, User, Calendar, MapPin } from 'lucide-react';
import { Plant } from '@/lib/types';
import Link from 'next/link';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function PlantSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay

  const { data: plants, isLoading } = useQuery({
    queryKey: ['plants', debouncedSearchTerm],
    queryFn: async (): Promise<Plant[]> => {
      if (!debouncedSearchTerm) return [];
      const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    },
    enabled: debouncedSearchTerm.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search plants by name or ID..."
          className="pl-10 pr-4 h-12 text-base"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && !debouncedSearchTerm && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
          </div>
        )}
      </div>

      {isLoading && debouncedSearchTerm && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Skeleton className="w-16 h-16 rounded-md flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {plants && plants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {plants.length} plant{plants.length !== 1 ? 's' : ''}
            </p>
            <Link href="/map">
              <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                View All on Map
              </button>
            </Link>
          </div>

          {plants.map((plant) => (
            <Card key={plant.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {plant.image_url ? (
                    <img
                      src={plant.image_url}
                      alt={plant.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-8 w-8 text-emerald-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{plant.name}</h3>
                        {plant.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {plant.description}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        ID: {plant.id}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="truncate">{plant.user_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(plant.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {plant.lat && plant.lng && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {plant.lat.toFixed(4)}, {plant.lng.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {plants && plants.length === 0 && debouncedSearchTerm && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No plants found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try searching with different keywords or browse all plants on the map
            </p>
            <Link href="/map">
              <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Browse All Plants
              </button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!searchTerm && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold mb-2">Search Plants</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enter a plant name or ID to search through our community's collection
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Try searching for: "Monstera", "Fiddle Leaf", "Succulent"</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}