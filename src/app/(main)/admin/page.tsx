'use client';

import { useAuth } from '@/app/context/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plant as LibPlant} from '@/lib/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Leaf, TrendingUp, MapPin } from 'lucide-react';

// Helper to safely normalize created_at
function normalizeCreatedAt(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (value && typeof (value as { toISOString?: unknown }).toISOString === 'function') {
    return (value as { toISOString: () => string }).toISOString();
  }
  return value != null ? String(value) : '';
}

interface Plant extends Omit<LibPlant, 'image_url' | 'created_at'> {
  image_url?: string; // Make it compatible
  created_at: string; // Ensure created_at is always a string
}

// Dynamically import the map component with proper props
const PlantMap = dynamic(() => import('@/app/components/map/PlantMap'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[400px] sm:h-[500px]" />,
});

interface AdminStats {
  total_plants: number;
  total_users: number;
  recent_plants: number;
}

interface ChartData {
  week: string;
  plants: number;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      redirect('/login');
    }

    const fetchData = async () => {
      try {
        // Fetch plants data for the map
        const plantsResponse = await fetch('/api/plants');
        const plantsData = await plantsResponse.json();
        // Ensure created_at is always a string
    const normalizedPlants = plantsData.map((plant: Plant) => ({
      ...plant,
      created_at: normalizeCreatedAt(plant.created_at)
    }));
        setPlants(normalizedPlants);
        setPlants(plantsData);

        // Fetch admin stats
        const statsResponse = await fetch('/api/admin/stats');
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch chart data
        const chartResponse = await fetch('/api/admin/chart');
        if (!chartResponse.ok) throw new Error('Failed to fetch chart data');
        const chartData = await chartResponse.json();
        setChartData(chartData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-8 w-8 text-emerald-600" />
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor platform statistics and user activity
        </p>
      </div>
      
      {loading ? (
        <div className="space-y-6">
          {/* Stats Skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-8 mb-4" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Map Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-[400px] sm:h-[500px]" />
            </CardContent>
          </Card>
          
          {/* Chart Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-80" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Plants</p>
                    <p className="text-2xl sm:text-3xl font-bold">{stats?.total_plants || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl sm:text-3xl font-bold">{stats?.total_users || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recent Plants (7d)</p>
                    <p className="text-2xl sm:text-3xl font-bold">{stats?.recent_plants || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Map Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                All Plant Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                <PlantMap plants={plants} />
                
                {/* Map Info Overlay */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium">{plants.length} plants</p>
                      <p>Click markers for details</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Chart Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Plants Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="plants" 
                      fill="#10b981" 
                      name="Plants Tracked"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Leaf className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-medium">View All Plants</p>
                    <p className="text-xs text-muted-foreground">Browse complete collection</p>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-medium">User Management</p>
                    <p className="text-xs text-muted-foreground">Manage user accounts</p>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-medium">Analytics</p>
                    <p className="text-xs text-muted-foreground">Detailed insights</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}