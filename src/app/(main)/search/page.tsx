'use client';

import PlantSearch from '@/app/components/search/PlantSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, TrendingUp, Users, MapPin } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Search Plants</h1>
            <p className="text-muted-foreground">
              Find plants by name, description, or user
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Card className="text-center">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-center mb-1">
                  <Search className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-lg sm:text-xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">Plants</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-lg sm:text-xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Users</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-center mb-1">
                  <MapPin className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-lg sm:text-xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">Locations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Search Component */}
      <PlantSearch />

      {/* Search Tips */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Search Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Plant Names</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Search by common names: &quot;Monstera&quot;, &quot;Fiddle Leaf&quot;</li>
                  <li>• Search by scientific names: &quot;Deliciosa&quot;, &quot;Lyrata&quot;</li>
                  <li>• Partial matches work: &quot;mon&quot; will find &quot;Monstera&quot;</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Descriptions</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Search care tips: &quot;low maintenance&quot;, &quot;drought&quot;</li>
                  <li>• Search characteristics: &quot;trailing&quot;, &quot;air purifier&quot;</li>
                  <li>• Search environments: &quot;indoor&quot;, &quot;low light&quot;</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Users</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Find plants by specific users</li>
                  <li>• Search by display names</li>
                  <li>• Discover community members</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Advanced</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Search by plant ID numbers</li>
                  <li>• Combine multiple terms</li>
                  <li>• Results are ranked by relevance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
