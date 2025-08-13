'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { query } from '@/app/config/db';

export default function PlantSearch() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: plants, isLoading } = useQuery(
    ['plants', searchTerm],
    async () => {
      if (!searchTerm) return [];
      const res = await query(
        'SELECT * FROM plants WHERE name ILIKE $1 OR id::text LIKE $1',
        [`%${searchTerm}%`]
      );
      return res.rows;
    },
    { enabled: searchTerm.length > 0 }
  );

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search plants by name or ID..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading && searchTerm && (
        <div className="mt-2 text-sm text-muted-foreground">Searching...</div>
      )}
      
      {plants && plants.length > 0 && (
        <div className="mt-4 space-y-2">
          {plants.map((plant) => (
            <div key={plant.id} className="p-3 border rounded-lg hover:bg-muted/50">
              <h3 className="font-medium">{plant.name}</h3>
              <p className="text-sm text-muted-foreground">ID: {plant.id}</p>
            </div>
          ))}
        </div>
      )}
      
      {plants && plants.length === 0 && searchTerm && (
        <div className="mt-2 text-sm text-muted-foreground">No plants found</div>
      )}
    </div>
  );
}