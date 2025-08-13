'use client';

import { useAuth } from '@/app/context/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import PlantForm from '@/app/components/forms/PlantForm';
import UserNameForm from '@/app/components/forms/UserNameForm';
import { useQuery } from '@tanstack/react-query';

type PlantFormProps = {
  userId?: string;
  userName: string;
};

export function PlantForm({ userId, userName }: PlantFormProps) {
  // Your component implementation
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [showNameForm, setShowNameForm] = useState(false);

  // Properly typed query with React Query v5 syntax
  const { data: userName } = useQuery({
    queryKey: ['userName', user?.uid],
    queryFn: async (): Promise<string | null> => {
      if (!user?.uid) return null;
      
      const response = await fetch(`/api/user/${user.uid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user name');
      }
      const data = await response.json();
      return typeof data === 'string' ? data : null;
    },
    enabled: !!user?.uid,
    // React Query v5 callback syntax
    staleTime: 60 * 1000, // 1 minute
    select: (data) => data, // Optional transformation
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
  });

  useEffect(() => {
    if (userName === null) {
      setShowNameForm(true);
    }
  }, [userName]);

  useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }
  }, [user, loading]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome{userName ? `, ${userName}` : ''}</h1>
      
      {showNameForm && (
        <UserNameForm 
          onSuccess={() => {
            setShowNameForm(false);
            // Consider invalidating the query here
          }} 
        />
      )}
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Track a New Plant</h2>
        <PlantForm userId={user?.uid} userName={userName} />
      </div>
    </div>
  );
}