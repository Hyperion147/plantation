'use client';

import { useAuth } from '@/app/context/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import PlantForm from '@/app/components/forms/PlantForm';
import UserNameForm from '@/app/components/forms/UserNameForm';
import { useQuery } from '@tanstack/react-query';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [showNameForm, setShowNameForm] = useState(false);

  const { data: userName } = useQuery<string | null>({
    queryKey: ['userName', user?.uid],
    queryFn: async (): Promise<string | null> => {
      if (!user?.uid) return null;
      
      const response = await fetch(`/api/user/${user.uid}`);
      if (!response.ok) throw new Error('Failed to fetch user name');
      const data = await response.json();
      return typeof data === 'string' ? data : null;
    },
    enabled: !!user?.uid
  });

  useEffect(() => {
    if (userName === null) setShowNameForm(true);
  }, [userName]);

  useEffect(() => {
    if (!loading && !user) redirect('/login');
  }, [user, loading]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome{userName ? `, ${userName}` : ''}</h1>
      
      {showNameForm && (
        <UserNameForm onSuccess={() => setShowNameForm(false)} />
      )}
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Track a New Plant</h2>
        <PlantForm 
          userId={user?.uid} 
          userName={userName || 'Guest'} // Provide fallback value
        />
      </div>
    </div>
  );
}