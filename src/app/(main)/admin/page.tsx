'use client';

import { useAuth } from '@/app/context/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { query } from '@/app/config/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminMap = dynamic(() => import('@/app/components/map/PlantMap'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[500px]" />,
});

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      redirect('/login');
    }

    // In a real app, you would check if the user is an admin here
    // For simplicity, we'll just proceed

    const fetchData = async () => {
      try {
        // Fetch total stats
        const statsRes = await query(`
          SELECT 
            COUNT(*) as total_plants,
            COUNT(DISTINCT user_id) as total_users,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_plants
          FROM plants
        `);
        
        // Fetch weekly data for chart
        const chartRes = await query(`
          SELECT 
            DATE_TRUNC('week', created_at) as week,
            COUNT(*) as plant_count
          FROM plants
          GROUP BY week
          ORDER BY week
        `);
        
        setStats(statsRes.rows[0]);
        setChartData(chartRes.rows.map(row => ({
          week: new Date(row.week).toLocaleDateString(),
          plants: row.plant_count,
        })));
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, authLoading]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="w-full h-32" />
          <Skeleton className="w-full h-[500px]" />
          <Skeleton className="w-full h-96" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Plants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats?.total_plants || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats?.total_users || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Plants (7d)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats?.recent_plants || 0}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>All Plant Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminMap />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Plants Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="plants" fill="#10b981" name="Plants Tracked" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}