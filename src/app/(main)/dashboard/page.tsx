'use client';

import { useAuth } from '@/app/context/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import PlantForm from '@/app/components/forms/PlantForm';
import UserNameForm from '@/app/components/forms/UserNameForm';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Leaf, Calendar, User } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [showNameForm, setShowNameForm] = useState(false);
  const [showPlantForm, setShowPlantForm] = useState(false);

  const { data: userData, isLoading: isUserDataLoading, refetch: refetchUser } = useQuery({
    queryKey: ['userData', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      
      const response = await fetch(`/api/user/${user.uid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    },
    enabled: !!user?.uid,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: userPlants, isLoading: isPlantsLoading } = useQuery({
    queryKey: ['userPlants', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      
      const response = await fetch(`/api/plants?userId=${user.uid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch plants');
      }
      return response.json();
    },
    enabled: !!user?.uid,
    staleTime: 30 * 1000, // 30 seconds
  });

  useEffect(() => {
    if (userData === null && !isUserDataLoading) {
      setShowNameForm(true);
    } else if (userData) {
      setShowNameForm(false);
    }
  }, [userData, isUserDataLoading]);

  useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }
  }, [user, loading]);

  if (loading || isUserDataLoading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = userData?.display_name || user?.displayName || user?.email?.split('@')[0] || 'Guest';

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome, {displayName}!</h1>
        <p className="text-muted-foreground">
          Track your plants and see your collection grow
        </p>
      </div>
      
      {showNameForm && (
        <UserNameForm 
          onSuccess={(name) => {
            setShowNameForm(false);
            refetchUser();
          }} 
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Plant Form Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Track a New Plant
            </h2>
            {!showPlantForm && (
              <Button 
                onClick={() => setShowPlantForm(true)}
                className="sm:hidden"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Plant
              </Button>
            )}
          </div>
          
          {showPlantForm ? (
            <div className="space-y-4">
              <PlantForm 
                userId={user?.uid} 
                userName={displayName} 
              />
              <Button 
                variant="outline" 
                onClick={() => setShowPlantForm(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Card className="hidden sm:block">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Add Your First Plant</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start tracking your plants with photos, descriptions, and locations
                    </p>
                    <Button onClick={() => setShowPlantForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Track a Plant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* User's Plants Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Plants
            </h2>
            <Link href="/map">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          
          {isPlantsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userPlants && userPlants.length > 0 ? (
            <div className="space-y-4">
              {userPlants.slice(0, 5).map((plant: any) => (
                <Card key={plant.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {plant.image_url ? (
                        <img 
                          src={plant.image_url} 
                          alt={plant.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <Leaf className="h-6 w-6 text-emerald-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{plant.name}</h3>
                        {plant.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {plant.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(plant.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {userPlants.length > 5 && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    And {userPlants.length - 5} more plants...
                  </p>
                  <Link href="/map">
                    <Button variant="outline" size="sm" className="mt-2">
                      View All Plants
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Leaf className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No Plants Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't tracked any plants yet. Start by adding your first plant!
                </p>
                <Button onClick={() => setShowPlantForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Plant
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}