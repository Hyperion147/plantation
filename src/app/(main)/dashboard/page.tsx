'use client';

import { useAuth } from '@/app/context/AuthContext';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import PlantForm from '@/app/components/forms/PlantForm';
import UserNameForm from '@/app/components/forms/UserNameForm';
import { query } from '@/app/config/db';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [userName, setUserName] = useState('');
  const [showNameForm, setShowNameForm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }

    if (user) {
      // Check if user name exists in database
      const fetchUserName = async () => {
        try {
          const res = await query('SELECT name FROM users WHERE uid = $1', [user.uid]);
          if (res.rows.length > 0 && res.rows[0].name) {
            setUserName(res.rows[0].name);
          } else {
            setShowNameForm(true);
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
        }
      };
      fetchUserName();
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
          onSuccess={(name) => {
            setUserName(name);
            setShowNameForm(false);
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